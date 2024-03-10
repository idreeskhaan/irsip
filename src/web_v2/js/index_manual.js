

//emergency handler function
function emergency(){

  var emergency_html="<button onclick='emergency();' type='button' class='btn btn-danger'>Shutting Down System</button><button class='btn btn-danger' type='button' disabled><span class='spinner-grow spinner-grow-sm' role='status' aria-hidden='true'></span></button>";
  document.getElementById("emergency").innerHTML=emergency_html;

  //write code to shutdown system

  //restore the button after system is successfully shutdown
  var delayInMilliseconds = 2000; //2 seconds

  setTimeout(function() {
    var emergency_html="<button onclick='emergency();' type='button' class='btn btn-danger'>Emergency STOP</button>";
    document.getElementById("emergency").innerHTML=emergency_html;
  }, delayInMilliseconds);

}

// Connecting to ROS (my Ubuntu)
  var ros = new ROSLIB.Ros({
    url : 'ws://192.168.0.122:9090'
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


//setup subscribers


//video topic for IntelRealSense

// subscribe to slider pos
var vid_topic = new ROSLIB.Topic({
  ros : ros,
  name : '/camera/color/image_raw',
  messageType : 'sensor_msgs/Image'
});

// subscribe to slider pos
var slider_pos = new ROSLIB.Topic({
  ros : ros,
  name : '/slider_pos',
  messageType : 'std_msgs/Float32'
});

//Setup publisher on motor_control
var motor_control = new ROSLIB.Topic({
  ros : ros,
  name : '/motor_control',
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


//publish /motor_control function
function publish_motor(){
  var motor_control_value= parseInt(document.getElementById("motor_control").value); //distance value in mm
  console.log("motor current: " + (motor_control_value));
  var speed=50; //speed command in us
  var motor_control_msg = new ROSLIB.Message({
  data : [motor_control_value, speed]
  });
  motor_control.publish(motor_control_msg);
}

//publish jetmaxA handler function
function publish_jetmaxA(){
  var x_A= parseInt(document.getElementById("x_A").value);
  var y_A= parseInt(document.getElementById("y_A").value); 
  var z_A= parseInt(document.getElementById("z_A").value);  
  if (x_A>=60){
    x_A=60;
  }
  //console.log(x_A + " " + y_A " " + z_A);
  console.log("Publish OK");

  var jetmaxA_control_msg= new ROSLIB.Message({
    x: x_A,
    y: y_A,
    z: z_A,
    duration: 2
    });
    jetmaxA_command.publish(jetmaxA_control_msg);
  
}

//publish jetmaxB handler function
function publish_jetmaxB(){
  var x_B= parseInt(document.getElementById("x_B").value);
  var y_B= parseInt(document.getElementById("y_B").value); 
  var z_B= parseInt(document.getElementById("z_B").value);  
  //console.log(x_A + " " + y_A " " + z_A);
  console.log("Publish OK");

  var jetmaxB_control_msg= new ROSLIB.Message({
    x: x_B,
    y: y_B,
    z: z_B,
    duration: 2
    });
    jetmaxB_command.publish(jetmaxB_control_msg);
}

//listen on Subscribers


//Listen for IntelRealsense Video

//get slider position
vid_topic.subscribe(function(message) {
  console.log('Received message on ' + vid_topic.name);
  //slider_pos.unsubscribe();
  //document.getElementById("slider_pos").innerHTML = "Slider Position: "+ parseInt(message.data) + " mm";
});


//get slider position
slider_pos.subscribe(function(message) {
  console.log('Received message on ' + slider_pos.name + ': ' + message.data);
  //slider_pos.unsubscribe();
  document.getElementById("slider_pos").innerHTML = "Slider Position: "+ parseInt(message.data) + " mm";
});

//get jetmaxA status
jetmaxA_status.subscribe(function(message) {
  //console.log('Received message on ' + jetmaxA_status.name + ': ' + message.y);
  //slider_pos.unsubscribe();
  document.getElementById("jetmaxA_status_x").innerHTML = "x: "+ parseInt(message.x);
  document.getElementById("jetmaxA_status_y").innerHTML = "y: "+ parseInt(message.y);
  document.getElementById("jetmaxA_status_z").innerHTML = "z: "+ parseInt(message.z);
});

//get jetmaxB status
jetmaxB_status.subscribe(function(message) {
  //console.log('Received message on ' + jetmaxA_status.name + ': ' + message.y);
  //slider_pos.unsubscribe();
  document.getElementById("jetmaxB_status_x").innerHTML = "x: "+ parseInt(message.x);
  document.getElementById("jetmaxB_status_y").innerHTML = "y: "+ parseInt(message.y);
  document.getElementById("jetmaxB_status_z").innerHTML = "z: "+ parseInt(message.z);
});



