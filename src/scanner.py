#!/usr/bin/env python3

import threading
import rospy
from std_msgs.msg import Int32
from std_msgs.msg import Float32MultiArray
from sensor_msgs.msg import Image
from std_msgs.msg import String
from paintrobot.srv import Stepper_Service
import cv2
from cv_bridge import CvBridge
import numpy as np
import open3d as o3d
from sklearn.cluster import KMeans
import time
import copy
import json
from Transforms import transl, rotate_x, rotate_y, rotate_z, axis_offset
from coating_essentials import create_pcd_obj
from paths import *

NODE_NAME= "scanner_node"
SCAN_POSITION= 220 #scanning position in mm.  FINAL= 220 mm


global_msg= String()
bridge = CvBridge()
servo_control_msg= Int32()
motor_control_msg= Float32MultiArray()
t1= threading.Thread(target=rospy.spin) #thread for rospy.spin


def publish_global(msg):
    global_msg.data= NODE_NAME + "=> " + msg
    global_pub.publish(global_msg)

def RBG_callback(color_msg_data):
    global color_img
    color_img = bridge.imgmsg_to_cv2(color_msg_data, desired_encoding='passthrough')

def depth_callback(depth_msg_data):
    global depth_img
    depth_img = bridge.imgmsg_to_cv2(depth_msg_data, desired_encoding='passthrough')


def align_object():

    rospy.wait_for_service('/stp')
    publish_global("Aligning Object for 3D scanning")
    resp= stp_srv(SCAN_POSITION, 60) #service call for stepper motor, awaits for response
    if resp==0:
        publish_global("Alignment successfull")
    if resp==1:
        publish_global("VlX read error")

def rotate_object():
    servo_control_msg.data= 0
    pub_servo_control.publish(servo_control_msg) #bring servo to zero
    time.sleep(5) #give some time for servo to get to the zero positio
    publish_global("Rotating Object to generate 3D scan")

    for idx in range(7): #Start scanning in this loop
        
        servo_control_msg.data= idx*30
        pub_servo_control.publish(servo_control_msg)
        publish_global("Current angle: " + str(idx*30))
        time.sleep(5.0)
        file_path_color= TEMP_PATH + "/color_" + str(idx*30) +".png"
        file_path_depth= TEMP_PATH + "/depth_" + str(idx*30) +".png"
        cv2.imwrite(file_path_color, color_img) #save the Color image into the path
        cv2.imwrite(file_path_depth, depth_img) #save the Depth image into the path
        np.save(TEMP_PATH + "/color_" + str(idx*30) +".npy", color_img)
        np.save(TEMP_PATH + "/depth_" + str(idx*30) +".npy", depth_img)
        rospy.loginfo(file_path_color + " saved")
        rospy.loginfo(file_path_depth + " saved")
    
    #restore zero position
    servo_control_msg.data= 0
    pub_servo_control.publish(servo_control_msg) #bring servo to zero


##Apply KMeans with 2 clusters 
def apply_KMeans(pts):
    model= KMeans(n_clusters=2)
    model.fit(pts)
    mask_bool= np.array(model.labels_, dtype=bool) #create a mask out of the KMeans labels
    pts_1= pts[(mask_bool)]
    pts_2= pts[~(mask_bool)]
    #check which is noise and which is the actual object
    if ((pts_1.shape)[0])>((pts_2.shape)[0]):
        filtered_pts=pts_1
        noise= pts_2
    else:
        filtered_pts=pts_2
        noise= pts_1
    return filtered_pts, noise #returns the 2 clusters


def apply_stat_noise_removal(pcd, nb_neighbors=700, std_ratio=0.60): #Best settings: 700, 0.60
    try:

        cl, ind= pcd.remove_statistical_outlier(nb_neighbors=nb_neighbors, std_ratio= std_ratio) 
        clean_pc= cl.select_by_index(ind) #Clean Point Cloud
        clean_pc.paint_uniform_color([0, 0, 0])

    except:
        clean_pc= create_pcd_obj(np.zeros(shape=(100,3)))

    return clean_pc #returns a clean pcd object

def draw_registration_result(source, target, transformation):
    source_temp= copy.deepcopy(source)
    target_temp= copy.deepcopy(target)
    source_temp.transform(transformation)
    source_temp.paint_uniform_color([1,0,0])
    o3d.visualization.draw_geometries([source_temp,target_temp])

def poisson_rec(pcd):
    print('run Poisson surface reconstruction')
    with o3d.utility.VerbosityContextManager(o3d.utility.VerbosityLevel.Debug) as cm:
        mesh, densities = o3d.geometry.TriangleMesh.create_from_point_cloud_poisson(pcd, depth=20)
    return mesh

def ballpivot_rec(pcd):
    radii = [0.05, 0.10]
    mesh = o3d.geometry.TriangleMesh.create_from_point_cloud_ball_pivoting(pcd, o3d.utility.DoubleVector(radii))
    return mesh



def get_pcd(): #this function converts the Raw scans into a clean PCD

    pcds_list= [] #empty list for storing all pcds
    pcds_pts= [] #stores the pts of each pcd
    PCsalign_obj= [] #stores the PCalign objects

    #Load the RGB and Depth image and convert to PCD
    for idx in range(7):
        file_path_color= TEMP_PATH + "/color_" + str(idx*30) +".npy"
        file_path_depth= TEMP_PATH + "/depth_" + str(idx*30) +".npy"
        color_img= np.load(file_path_color)
        depth_img= np.load(file_path_depth)
        colorr= o3d.cpu.pybind.geometry.Image(color_img)
        depthh= o3d.cpu.pybind.geometry.Image(depth_img)
        rgbd_image = o3d.geometry.RGBDImage.create_from_color_and_depth(colorr,depthh)
        pcd = o3d.geometry.PointCloud.create_from_rgbd_image(rgbd_image,o3d.camera.PinholeCameraIntrinsic(o3d.camera.PinholeCameraIntrinsicParameters.PrimeSenseDefault))
        pcds_list.append(pcd)
        pcds_pts.append(np.asarray(pcd.points))

                            ## Apply Initial Filter on the PCD ##
    #Box Filter settings
    filter_lowerlimit_x= -0.18 
    filter_upperlimit_x= 0.07 
    filter_lowerlimit_y= -0.030 
    filter_upperlimit_y= 0.19 
    filter_lowerlimit_z= axis_offset - 0.04  
    filter_upperlimit_z= axis_offset + 0.04 

    scan_pts= np.array([]) #stores all the points of the ENTIRE SCAN

    ##Filter, Raw Align, and ICP register in this Loop
    for idx in range(7):
        mask_x= (pcds_pts[idx][:,0] >= filter_lowerlimit_x) & (pcds_pts[idx][:,0] <= filter_upperlimit_x)
        mask_y= (pcds_pts[idx][:,1] >= filter_lowerlimit_y) & (pcds_pts[idx][:,1] <= filter_upperlimit_y)
        mask_z= (pcds_pts[idx][:,2] >= filter_lowerlimit_z) & (pcds_pts[idx][:,2] <= filter_upperlimit_z)
        mask= mask_x & mask_y & mask_z #Combined Mask
        pcd_pts_filtered= pcds_pts[idx][mask]
        PC= np.ones(shape=(pcd_pts_filtered.shape[0], 4)) # (m,4)
        PC[:,0:3]= pcd_pts_filtered  #pcd in {C}

        #apply transformations
        TS1rC= np.matmul(rotate_y(np.deg2rad(-idx*30)), transl(0,0,-axis_offset))  # {S1r} -> {C}
        PS1r= np.transpose(np.matmul(TS1rC, np.transpose(PC)))   #dim (m,4): pcd in {S1r}
        TCS1= transl(0,0,axis_offset)  # {C} -> {S1}
        PC_align= np.transpose(np.matmul(TCS1, np.transpose(PS1r))) #dim (m,4): Aligned Pcd in {C}
        PCsalign_obj.append(create_pcd_obj(PC_align[:,0:3])) #aligned pcd to be used by ICP in frame {C}

        #assign source and target for ICP
        source= PCsalign_obj[idx]  #changes at each loop: represented by P in ICP eqn
        target= PCsalign_obj[0]  #THE MERGED PCD should be in {C} : represented by Q in ICP eqn
        
        ##p2p ICP
        threshold=0.1 #best: 0.1
        trans_init= np.eye(4)
        reg_p2p= o3d.pipelines.registration.registration_icp(
            source, target, threshold, trans_init,
            o3d.pipelines.registration.TransformationEstimationPointToPoint(),
            o3d.pipelines.registration.ICPConvergenceCriteria(max_iteration=2000))
        
        #GET THE ALIGNED SOURCE into TARGET frame
        source_align_pts= np.asarray(source.transform(reg_p2p.transformation).points)

        #only these indexes
        scan_pts= np.append(scan_pts, source_align_pts).reshape(-1,3)

    #save the scan
    pcd_save_path= SCAN_PATH + CURRENT_CAD.replace(".STL", "-scan") + ".npy"
    np.save(pcd_save_path, scan_pts)
    publish_global("Geometry stored: " + pcd_save_path)


#handler for generating scan
def scan_status_callback(scan_status_msg):

    #load settings.json
    with open(JSON_PATH, "r") as f:
        settings= json.load(f)

    global CURRENT_CAD
    CURRENT_CAD= "/" + settings["cad_list"][settings["current_cad"]]
  
    if scan_status_msg.data== 1:
        rospy.loginfo("scan started")
        align_object() #Moves the slider to the SCAN POSITION
        rotate_object() #Rotates the servo motor and stores the scans in npy arrays
        get_pcd() #converts raw scans into a clean PCD
        rospy.loginfo("scan completed")

        
#Define Subscribers and Publishers
pub_servo_control= rospy.Publisher("/servo", Int32, queue_size=1)
stp_srv= rospy.ServiceProxy("/stp", Stepper_Service)
RGB_sub= rospy.Subscriber("/camera/color/image_raw", Image, RBG_callback)
depth_sub= rospy.Subscriber("/camera/depth/image_rect_raw", Image, depth_callback)
scan_status= rospy.Subscriber("/scan_status", Int32, scan_status_callback) #Listener for Scan command from Webpage
global_pub= rospy.Publisher("/global", String, queue_size=1)
rospy.init_node(NODE_NAME)  #Initialize the Node

def main():

    t1.start() #Start listening for subscriptions without halting the program flow
    time.sleep(3)
    rospy.loginfo(f"{NODE_NAME} started")

    while not (rospy.is_shutdown()):
        pass
        
    ## Wait for thread to Stop
    t1.join()
    rospy.loginfo(f"{NODE_NAME} terminated")


if __name__== "__main__":
    main()






