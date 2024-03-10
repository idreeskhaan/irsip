

//HANDLER FUNCTIONS START

// event handlers for vid cams
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
    document.getElementById('vid_src').src= "http://192.168.0.108:8080/stream?topic=/usb_cam/image_rect_color";
}

function robotB_cam(){
    document.getElementById('vid_src').src= "http://192.168.0.112:8080/stream?topic=/usb_cam/image_rect_color";
}


function start_scan(){
  //alert("3D Scanning Started");
  var scan_status_msg = new ROSLIB.Message({data : 1});
  scan_status.publish(scan_status_msg);

}


function view_scan(){
  
  var view_scan_msg = new ROSLIB.Message({data : 1});
  view_scan_status.publish(view_scan_msg);

}


function start_traj(){

  var start_traj_status_msg = new ROSLIB.Message({data : 1});
  start_traj_status.publish(start_traj_status_msg);
  
}


function view_traj(){

  var view_traj_status_msg = new ROSLIB.Message({data : 1});
  view_traj_status.publish(view_traj_status_msg);
  
}



function exec_traj(){

  var exec_traj_status_msg = new ROSLIB.Message({data : 1});
  exec_traj_status.publish(exec_traj_status_msg);
  
}



function stop_traj(){

  var exec_traj_status_msg = new ROSLIB.Message({data : 0});
  exec_traj_status.publish(exec_traj_status_msg);
  
}


//HANDLER FUNCTIONS END //


// Connecting to ROS (my Ubuntu)
var ros = new ROSLIB.Ros({
  url : 'ws://localhost:9090'
});


ros.on('connection', function() {
  console.log('Connected to websocket server.');
});

ros.on('error', function(error) {
  console.log('Error connecting to websocket server: ', error);
});

ros.on('close', function() {
  console.log('Connection to websocket server closed.');
});

//connect to websocket jetmax A
var jetmaxA = new ROSLIB.Ros({
  url : 'ws://192.168.0.108:9090'
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

//connect to websocket jetmax B
var jetmaxB = new ROSLIB.Ros({
  url : 'ws://192.168.0.112:9090'
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

//setup publihsers and subscribers START

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



// subscribe to slider pos
var slider_pos = new ROSLIB.Topic({
  ros : ros,
  name : '/slider_pos',
  messageType : 'std_msgs/Float32'
});

// subscribe to slider pos
var servo_read = new ROSLIB.Topic({
  ros : ros,
  name : '/servo_read',
  messageType : 'std_msgs/Int32'
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
var jetmaxB_traj_listener = new ROSLIB.Topic({
  ros : ros,
  name : '/exec_traj_jetmaxB',
  messageType : 'std_msgs/Float32MultiArray'
});


//setup publihsers and subscribers END


//PUBLISHERS START //


//PUBLISHERS END //




//SUBSCRIPTIONS START //

//get slider position
slider_pos.subscribe(function(message) {
  //console.log('Received message on ' + slider_pos.name + ': ' + message.data);
  //slider_pos.unsubscribe();
  document.getElementById("slider_pos").innerHTML = "Slider: "+ parseInt(message.data) + " mm";
});

//get servo angle
servo_read.subscribe(function(message) {
  //console.log('Received message on ' + servo_read.name + ': ' + message.data);
  //slider_pos.unsubscribe();
  document.getElementById("servo_read").innerHTML = "Servo: "+ parseInt(message.data) + " deg";
});


//get jetmaxB status. This function is called whenever a msg on the topic: '/exec_traj_jetmaxB' is received
jetmaxB_traj_listener.subscribe(function(message) {

  //cache the traj sent from ROS master
  var traj= message.data;
  var x_B= traj[0];
  var y_B= traj[1];
  var z_B= traj[2];

  //publishs Traj to JetMaxB Robot
  var jetmaxB_control_msg= new ROSLIB.Message({
    x: x_B,
    y: y_B,
    z: z_B,
    duration: 2
    });
  jetmaxB_command.publish(jetmaxB_control_msg);  //publish the message


});


//SUBSCRIPTIONS END //