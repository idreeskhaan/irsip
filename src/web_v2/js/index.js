
//IP ADDRESSES
const ROSMASTER_IP= '192.168.0.109';
const ROBOTA_IP= '192.168.0.112';
const ROBOTB_IP= '192.168.0.108';


//Handlers for Video Frames
function usb_cam(){
    document.getElementById('vid_src').src= "http://0.0.0.0:8080/stream?topic=/usbcam";
}

function rgb_cam(){
    document.getElementById('vid_src').src= "http://0.0.0.0:8080/stream?topic=/camera/color/image_raw";
}

function depth_cam(){
    document.getElementById('vid_src').src= "http://0.0.0.0:8080/stream?topic=/camera/depth/image_rect_raw";
}

function robotA_cam(){
    document.getElementById('vid_src').src= `http://${ROBOTA_IP}:8080/stream?topic=/usb_cam/image_rect_color`;
}

function robotB_cam(){
    document.getElementById('vid_src').src= `http://${ROBOTB_IP}:8080/stream?topic=/usb_cam/image_rect_color`;
}


//Handler funtions
function start_scan(){

  var scan_status_msg = new ROSLIB.Message({data : 1});
  scan_status.publish(scan_status_msg);

}

function view_scan(){
  
  var view_scan_msg = new ROSLIB.Message({data : 1});
  view_scan_status.publish(view_scan_msg);

}


function calibrate_cad(){

  var calibrate_msg = new ROSLIB.Message({data : 0});
  calibrate.publish(calibrate_msg);

}


function view_calcad(){

  var view_cadcal_msg= new ROSLIB.Message({data: 1});
  view_cadcal_pub.publish(view_cadcal_msg);

  
}

function plan_traj(){

  var start_traj_status_msg = new ROSLIB.Message({data : 1});
  start_traj_status.publish(start_traj_status_msg);
  
}


function optimize_traj(){

  var joint_opt_msg= new ROSLIB.Message({data: 1});
  joint_opt_ping.publish(joint_opt_msg); 

}

function view_traj(){

  var view_traj_status_msg = new ROSLIB.Message({data : 1});
  view_traj_status.publish(view_traj_status_msg);
  
}


function view_coating(){

  var view_coating_msg= new ROSLIB.Message({data: 1});
  view_coating_ping.publish(view_coating_msg);

}


function upload_trajA(){

  var exec_traj_status_msg = new ROSLIB.Message({data : 1});
  exec_traj_status.publish(exec_traj_status_msg);

}

function stop_trajA(){

  var exec_traj_status_msg = new ROSLIB.Message({data : 0});
  exec_traj_status.publish(exec_traj_status_msg);
  
}

function upload_trajB(){

  var exec_traj_status_msg = new ROSLIB.Message({data : 2});
  exec_traj_status.publish(exec_traj_status_msg);

}


function stop_trajB(){

  var exec_traj_status_msg = new ROSLIB.Message({data : 3});
  exec_traj_status.publish(exec_traj_status_msg);
  
}

//function for updating optimizer settings
function update_settings(){

  //get form inputs
  var h= parseFloat(document.getElementById("h_mm").value);
  var cad_scan= parseFloat(document.getElementById("cad_scan").value);
  var w1= parseFloat(document.getElementById("w1").value);
  var w2= parseFloat(document.getElementById("w2").value);
  var w3= parseFloat(document.getElementById("w3").value);
  var w4= parseFloat(document.getElementById("w4").value);
  var a= parseFloat(document.getElementById("a_mm").value);
  var b= parseFloat(document.getElementById("b_mm").value);
  var beta1= parseFloat(document.getElementById("beta1").value);
  var beta2= parseFloat(document.getElementById("beta2").value);
  var vmin= parseFloat(document.getElementById("vmin").value);
  var vmax= parseFloat(document.getElementById("vmax").value);
  var d_ideal= parseFloat(document.getElementById("d_ideal").value);
  var kmax= parseFloat(document.getElementById("kmax").value);
  var th= parseFloat(document.getElementById("th").value);
  var eq_slicing= parseInt(document.getElementById("eq_slicing").value);
  var th_x= parseFloat(document.getElementById("th_x").value);
  var th_y= parseFloat(document.getElementById("th_y").value);
  var th_z= parseFloat(document.getElementById("th_z").value);
  var surf= parseInt(document.getElementById("surf").value);
  
  
  //update settings.json
  var js_msg_str= JSON.stringify({"h": h, "cad_scan": cad_scan, "w1": w1, "w2": w2, "w3":w3, "w4":w4, "a":a, "b":b,
   "beta1":beta1, "beta2":beta2, "vmin":vmin, "vmax":vmax,
    "d_ideal":d_ideal, "kmax":kmax, "th": th, "eq_slicing": eq_slicing, "th_xyz": [th_x, th_y, th_z], "surf": surf });
  var json_js_msg= new ROSLIB.Message({data: js_msg_str});
  json_js_pub.publish(json_js_msg);

}

//sends validate token to the backend
function validate_3Dscan(){

  var validate_msg= new ROSLIB.Message({data: [1, 0, 0, 0]})
  validate_pub.publish(validate_msg);

}

//sends validate token to the backend
function validate_energy(){

  var validate_msg= new ROSLIB.Message({data: [0, 1, 0, 0]})
  validate_pub.publish(validate_msg);

}


//sends validate token to the backend
function validate_pquality(){

  var validate_msg= new ROSLIB.Message({data: [0, 0, 1, 0]})
  validate_pub.publish(validate_msg);

}


//HANDLER FUNCTIONS for Updating Current CAD, SCAN and TRAJ, CADCAL
function cad_list_onclick(data, i){

  var js_msg_str= JSON.stringify({"current_cad": i, "current_scan":data['current_scan'], "current_traj":data['current_traj'], "current_cadcal": data['current_cadcal']});
  var json_js_msg= new ROSLIB.Message({data: js_msg_str});
  json_js_pub.publish(json_js_msg);

}

function scan_list_onclick(data,i){

  var js_msg_str= JSON.stringify({"current_cad": data['current_cad'], "current_scan":i, "current_traj":data['current_traj'], "current_cadcal": data['current_cadcal']});
  var json_js_msg= new ROSLIB.Message({data: js_msg_str});
  json_js_pub.publish(json_js_msg);

}

function traj_list_onclick(data,i){

  var js_msg_str= JSON.stringify({"current_cad": data['current_cad'], "current_scan":data['current_scan'], "current_traj":i, "current_cadcal": data['current_cadcal']});
  var json_js_msg= new ROSLIB.Message({data: js_msg_str});
  json_js_pub.publish(json_js_msg);

}


function cadcal_list_onclick(data,i){

  var js_msg_str= JSON.stringify({"current_cad": data['current_cad'], "current_scan":data['current_scan'], "current_traj":data['current_traj'], "current_cadcal": i});
  var json_js_msg= new ROSLIB.Message({data: js_msg_str});
  json_js_pub.publish(json_js_msg);

}


//JSON LISTENER AND FILE LIST UPDATER
function update_file_list(){
 
  var json_msg= new ROSLIB.Message({data: 1});
  json_ping.publish(json_msg);

  //get /json_stream
  json_sub.subscribe(function(message) {
  data= JSON.parse(message.data);

  cad_html= ""; //empty string
  scan_html= ""; //empty string
  traj_html= ""; //empty string
  cadcal_html= "";

  var str_toInsert=  JSON.stringify(data);

  for (let i = 0; i < data['cad_list'].length; i++) {
    
    cad_html= cad_html + "<a onclick='cad_list_onclick("+ str_toInsert + ","+ i + ");' class='dropdown-item'>" + data['cad_list'][i] + "</a>";
    
  }
  for (let i = 0; i < data['scan_list'].length; i++) {
    
    scan_html= scan_html + "<a onclick='scan_list_onclick("+ str_toInsert + ","+ i + ");' class='dropdown-item'>" + data['scan_list'][i] + "</a>";
    
  }

  for (let i = 0; i < data['traj_list'].length; i++) {
    traj_html= traj_html + "<a onclick='traj_list_onclick("+ str_toInsert + ","+ i + ");' class='dropdown-item'>" + data['traj_list'][i] + "</a>";
    
  }

  for (let i = 0; i < data['cadcal_list'].length; i++) {
    cadcal_html= cadcal_html + "<a onclick='cadcal_list_onclick("+ str_toInsert + ","+ i + ");' class='dropdown-item'>" + data['cadcal_list'][i] + "</a>";
    
  }

  document.getElementById("cad_list").innerHTML=cad_html;
  document.getElementById("scan_list").innerHTML=scan_html;
  document.getElementById("traj_list").innerHTML=traj_html;
  document.getElementById("cadcal_list").innerHTML=cadcal_html;
  });
  


}


//Connect to ROS Master
var ros = new ROSLIB.Ros({ 
  url : `ws://${ROSMASTER_IP}:9090`
});


ros.on('connection', function() {
  console.log('Connected to websocket server ROS Master');
});

ros.on('error', function(error) {
  console.log('Error connecting to websocket server ROS Master: ', error);
});

ros.on('close', function() {
  console.log('Connection to websocket server closed ROS Master');
});

//Connect to JetmaxA ROBOT
var jetmaxA = new ROSLIB.Ros({
  url : `ws://${ROBOTA_IP}:9090`
});

jetmaxA.on('connection', function() {
  console.log('Connected to websocket server Jetmax A.');
});

jetmaxA.on('error', function(error) {
  console.log('Error connecting to websocket server Jetmax A: ', error);
});

jetmaxA.on('close', function() {
  console.log('Connection to websocket server Jetmax A closed.');
});

//Connect to JetmaxB ROBOT
var jetmaxB = new ROSLIB.Ros({
  url : `ws://${ROBOTB_IP}:9090`
});

jetmaxB.on('connection', function() {
  console.log('Connected to websocket server Jetmax B.');
});

jetmaxB.on('error', function(error) {
  console.log('Error connecting to websocket server Jetmax B: ', error);
});

jetmaxB.on('close', function() {
  console.log('Connection to websocket server Jetmax B closed.');
});



//TOPIC DEFINITIONS// 

//scan_status-
var scan_status = new ROSLIB.Topic({
  ros : ros,
  name : '/scan_status',
  messageType : 'std_msgs/Int32'
});

//view_scan_status
var view_scan_status = new ROSLIB.Topic({
  ros : ros,
  name : '/view_scan',
  messageType : 'std_msgs/Int32'
});


//plan_traj_status
var start_traj_status = new ROSLIB.Topic({
  ros : ros,
  name : '/start_traj_status',
  messageType : 'std_msgs/Int32'
});


//view_traj_status
var view_traj_status = new ROSLIB.Topic({
  ros : ros,
  name : '/view_traj_status',
  messageType : 'std_msgs/Int32'
});

//exec_traj_status
var exec_traj_status = new ROSLIB.Topic({
  ros : ros,
  name : '/exec_traj_status',
  messageType : 'std_msgs/Int32'
});


// subscribe to VLX sensors
var vlx_sub = new ROSLIB.Topic({
  ros : ros,
  name : '/vlx',
  messageType : 'std_msgs/Float32MultiArray'
});


//Setup publisher on motor_control
var motor_control = new ROSLIB.Topic({
  ros : ros,
  name : '/stp',
  messageType : 'std_msgs/Float32MultiArray'
});

// subscribe to JetmaxA status
var jetmaxA_status = new ROSLIB.Topic({
ros : jetmaxA,
name : '/jetmax/status',
messageType : 'jetmax_control/JetMax'
});

// subscribe to JetmaxB status
var jetmaxB_status = new ROSLIB.Topic({
ros : jetmaxB,
name : '/jetmax/status',
messageType : 'jetmax_control/JetMax'
});

//setup publisher on /jetmax/command for JetMax A:
var jetmaxA_command = new ROSLIB.Topic({
  ros : jetmaxA,
  name : '/jetmax/command',
  messageType : 'jetmax_control/SetJetMax'
});

//setup publisher on /jetmax/command for JetMax B:
var jetmaxB_command = new ROSLIB.Topic({
  ros : jetmaxB,
  name : '/jetmax/command',
  messageType : 'jetmax_control/SetJetMax'
});

//setup Subcriber on topic '/exec_traj_jetmaxB'
var jetmaxA_traj_listener = new ROSLIB.Topic({
  ros : ros,
  name : '/exec_traj_jetmaxA',
  messageType : 'std_msgs/Float32MultiArray'
});

//setup Subcriber on topic '/exec_traj_jetmaxB'
var jetmaxB_traj_listener = new ROSLIB.Topic({
  ros : ros,
  name : '/exec_traj_jetmaxB',
  messageType : 'std_msgs/Float32MultiArray'
});


//Global msg subsriber
var global_sub = new ROSLIB.Topic({
  ros : ros,
  name : '/global',
  messageType : 'std_msgs/String'
});


//publisher for Validation Tokens
var validate_pub = new ROSLIB.Topic({
  ros: ros,
  name: "/validate",
  messageType: 'std_msgs/Float32MultiArray'
});


//Subscriber to simind of 3D scan
var simind_sub = new ROSLIB.Topic({
  ros: ros,
  name: "/simindex",
  messageType: 'std_msgs/String'
});

//Publisher for /json_settings
var json_ping= new ROSLIB.Topic({
  ros: ros,
  name: "/json_ping",
  messageType: "std_msgs/Int32"
});

//topic for json stream coming from python backend
var json_sub= new ROSLIB.Topic({
  ros: ros,
  name: "/json_stream",
  messageType: "std_msgs/String"
});

//topic for json stream coming from python backend
var json_js_pub= new ROSLIB.Topic({
  ros: ros,
  name: "/json_js",
  messageType: "std_msgs/String"
});

//topic for /amps
var amp1_sub= new ROSLIB.Topic({
  ros: ros,
  name: "/amp1",
  messageType: 'std_msgs/Float32'
});

//topic for /amps
var amp2_sub= new ROSLIB.Topic({
  ros: ros,
  name: "/amp2",
  messageType: 'std_msgs/Float32'
});

//topic for calibration of CAD file with SCAN
var calibrate= new ROSLIB.Topic({
  ros: ros,
  name: "/calibrate",
  messageType: 'std_msgs/Int32'
});


//topic for Viewing CADCAL
var view_cadcal_pub= new ROSLIB.Topic({
  ros: ros,
  name: "/view_cadcal",
  messageType: 'std_msgs/Int32'
});


//topic for joint optimizer ping
var joint_opt_ping= new ROSLIB.Topic({
  ros: ros,
  name: "/joint_opt",
  messageType: 'std_msgs/Int32'
});

//topic for Viewing coating
var view_coating_ping= new ROSLIB.Topic({
  ros: ros,
  name: "/view_coating",
  messageType: 'std_msgs/Int32'
});



//Start Listening on Topics
//get VLX data
vlx_sub.subscribe(function(message) {
  document.getElementById("vlx1").innerHTML = "vlx1: "+ parseInt(message.data[0]) + " mm";
  document.getElementById("vlx2").innerHTML = "vlx2: "+ parseInt(message.data[1]) + " mm";
  document.getElementById("vlx3").innerHTML = "vlx3: "+ parseInt(message.data[2]) + " mm";
  document.getElementById("vlx4").innerHTML = "vlx4: "+ parseInt(message.data[3]) + " mm";
});

//amps data
amp1_sub.subscribe(function(message) {
  document.getElementById("powerA").innerHTML = "PowerA: "+ parseFloat(12*(message.data)).toFixed(2) + " W";
});

amp2_sub.subscribe(function(message) {
  document.getElementById("powerB").innerHTML = "PowerB: "+ parseFloat(12*(message.data)).toFixed(2) + " W";
});


//receive traj from ROS Master and publish to jetmaxA
jetmaxA_traj_listener.subscribe(function(message) {

  //cache the traj sent from ROS master
  var traj= message.data;
  var x_A= traj[0];
  var y_A= traj[1];
  var z_A= traj[2];
  var dur_A= traj[3];

  //publishs Traj to JetMaxA Robot
  var jetmaxA_control_msg= new ROSLIB.Message({
    x: x_A,
    y: y_A,
    z: z_A,
    duration: dur_A
    });
  jetmaxA_command.publish(jetmaxA_control_msg);  //publish the message


});

//receive traj from ROS Master and publish to jetmaxB
jetmaxB_traj_listener.subscribe(function(message) {

  //cache the traj sent from ROS master
  var traj= message.data;
  var x_B= traj[0];
  var y_B= traj[1];
  var z_B= traj[2];
  var dur_B= traj[3];

  //publishs Traj to JetMaxB Robot
  var jetmaxB_control_msg= new ROSLIB.Message({
    x: x_B,
    y: y_B,
    z: z_B,
    duration: dur_B
    });
  jetmaxB_command.publish(jetmaxB_control_msg);  //publish the message


});


//Listen for Global Msg
global_sub.subscribe(function(message) {
  document.getElementById("global_msg").innerHTML= message.data
});


//Listen for sim index
simind_sub.subscribe(function(message) {
  document.getElementById("simind").innerHTML = "3D Scan Accuracy: " + message.data;
});




