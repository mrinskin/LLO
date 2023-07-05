
const { ipcRenderer } = require("electron");

// Serial Port
const { SerialPort } = require('serialport')
var sp = null;


// Initialize variables
var response = "A 'Large Language Object' Game Co-created by Haoheng + Mrinalini + Open AI for Marcelo Coelho's Class on Interaction Intelligence @ MIT \n \nPress [X] to: \nEmbark on Your Journey as a Citizen Fact Checker";
var w = 400;
var h = 900;  

// GPT Connection via OpenAI NodeJS
//////////////////////////////////////////////////////////////////
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


//let prompt = "Play a scenario-based situation puzzle game around the theme of misinformation with me. The actors in the game may include- the local police, local journalists, witnesses, international news agencies, local and national politicians, different communities, etc. Parts of the situation may be true, false, out of context, or half true. If the situation is false or half true, one or many actors have created the false news knowingly or unknowingly. There is a correct answer to the game that you know, but keep the answer a secret until I make the right guess. I am a citizen fact checker and need to find out what happened. I have tools and ways to investigate i.e., interview the actors, check the WhatsApp messages of the actor, reverse image search the news, call local authorities, and find out who else is involved. List all the options that I can choose to investigate the scenario and ask me which options I want to choose for the next step.";
let prompt = "Play a scenario-based situation puzzle game around the theme of misinformation with me. The actors in the game may include- the local police, local journalists, witnesses, international news agencies, local and national politicians, different communities, etc. Parts of the situation may be true, false, out of context, or half true. If the situation is false or half true, one or many actors have created the false news knowingly or unknowingly. There is a correct answer to the game that you know, but keep the answer a secret until I make the right guess. I am a citizen fact checker and need to find out what happened. I have tools and ways to investigate i.e., interview the actors, check the WhatsApp messages of the actor, reverse image search the news, call local authorities, and find out who else is involved. Give me the situation in the form of an Alert and ask me how I would like to start my investigation.";
let res_json;
let messages = [];

let caption;
let captionprompt;

let img;
let res_img;
var imgurl = "https://github.com/mrinskin/LLO/blob/main/A%20Mystery%20for%20You.jpg?raw=true";

async function getAnswer() {
    //Chat
    messages.push({role: "user", content: prompt});
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        messages
      });
      res_json  = completion.data.choices[0].message;
      messages.push(res_json);

      response = completion.data.choices[0].message.content;
      console.log(response);
      sendToArduino(response);


    //Generate a caption
    let segments = response.split("\n\n");
    let seg = segments[0].split(": ");
    console.log(seg[1]); //
    captionprompt = "'" + seg[1] + "'Describe the paragraph above as if it is a black and white neo noir block print line artwork."
    const description = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        messages:[{role: "user", content: captionprompt}]
      });

      caption = description.data.choices[0].message.content;
      console.log(caption);

    //Create an image
    const image = await openai.createImage({
        prompt: "black and white neo noir bock print line artwork" + caption,
        n: 2,
        size: "1024x1024",
      });
      res_img = image.data;
      console.log(res_img);
      console.log(res_img.data[0].url);
      imgurl = res_img.data[0].url;
      //const myImage = new Image(400,400);
      //myImage.src = "C:/Users/mrina/Downloads/Image3.jpg";
      //myImage.src = imgurl;
      //var raw = new Uint8ClampedArray(1024*1024*4); 
      var myImage = new Image(1024, 1024);
      myImage.onload = function () {
        //alert("image is loaded");
        //var myImageData = getImageData(370, 20, 350, 350);
        //createImageBitmap(myImage);
        //console.log(ImageBitmap.toString());
        createImageBitmap(myImage)
        .then(im => {
            console.log(myImage.getImageData().toString());
            console.log(im);

            //sendToArduino(im.ImageData.data);
            //drawImage(im, 0, 0);
            //console.log(getImageData(0, 0, 500, 500).data);
        });
      }
      myImage.src = imgurl;  


}



// SERIAL PORT
//////////////////////////////////////////////////////////////////
// https://serialport.io/docs/guide-usage

// to list serial port, use these commands in terminal:
// ls /dev/tty.*
// ls /dev/cu.*

//"model":"gpt-3.5-turbo-0301",

sp = new SerialPort({ path: 'COM6', baudRate: 19200 });
sp.open(function (err) {
    if (err) {
        return console.log(err.message)
    }
})

// The open event is always emitted
sp.on('open', function () {
    // open logic
    console.log("Serial Port Opened");
})


// Write data to serial port 
function sendToArduino(data) {
    sp.write(data);
}


// Read data from serial port
sp.on('data', function (data) {
    console.log(data[0])    // print data to console
    response = data[0];     // write it to response so we can show on canvas

})




// MAIN APP
//////////////////////////////////////////////////////////////////
function setup() {
    createCanvas(w, h);
}


function draw() {
    background(255);
    textSize(14);
    fill(0, 0, 0);

    //text(response, 0, 0.52*w, 0.6*w, 0.9*h);
    text(response, 20, 400, 350, 450);


    img = createImg(imgurl, 'illustration');
    img.size(350, 350);
    //img.position(0.4*w, 0.05*w);
    img.position(370, 20);

    
}


// KEYBOARD INPUT
//////////////////////////////////////////////////////////////////
function keyPressed() {

    if (key == 'X' || key == 'x') {
        getAnswer();
        //sendToArduino(getAnswer());
        //sendToArduino("X");
    }
    else if(key == 'I' || key == 'i'){
        getImg();
    }
    
    else if(key == 'T' || key == 't'){
        prompt = "I think the news is True. If the news is actually true, congratulate me for solving the mystery solved and tell me more about being a good citizen fact checker. If I am wrong, tell me my I shouldn't come to conclusions so quickky."
        getAnswer();
    }

    else if(key == 'V' || key == 'v'){
        prompt = "I think the news is False. If the news is actually false, congratulate me for solving the mystery solved and tell me more about being a good citizen fact checker. If I am wrong, tell me my I shouldn't come to conclusions so quickky."
        getAnswer();
    }

    //else if(key == 'L' || key == 'l'){
      
        //sendToArduino(data)
    //}

    //else if(key == 'H' || key == 'h'){
        //prompt = "I think the news is False. If the news is actually false, congratulate me for solving the mystery solved and tell me more about being a good citizen fact checker. If I am wrong, tell me my I shouldn't come to conclusions so quickky."
        //getAnswer();
        //sendToArduino(data)
        //sendToArduino(console.log)
    //}

    }


    
    // [1] INVESTIGATE 

    //else if(key == '1' && key == 'A' || key == '1' && key == 'a'){
        //prompt = "I would like to Investigate the Local Police";
        //if(messages.length==2){
            //prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell mw what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        //}
        //getAnswer();
    //}



let keys = {
    k1: false, //Investigate
    k2: false, //Interview
    k3: false, //Check Whatsapp Message of
    k4: false, //Reverse Image Search
    k5: false, //Check Social Media Account of
    a: false, //Local Police
    b: false, //The Accused
    c: false, //Politicians
    d: false, //Journalists
    e: false, //Local Community
    f: false, //Protesters
    g: false, //Video Evidence
    h: false, //Photo Evidence
    i: false, //CCTV Footage
    j: false, //Local Athorities
  };

  addEventListener("keydown", (event) => {

    if (event.key === "1") {
        keys.k1 = true;
      }
  
    if (event.key === "2") {
        keys.k2 = true;
    }

    if (event.key === "3") {
        keys.k3 = true;
    }
      
    if (event.key === "4") {
        keys.k4 = true;
    }

    if (event.key === "5") {
        keys.k5 = true;
    }

    if (event.key === "a") {
      keys.a = true;
    }

    if (event.key === "b") {
        keys.b = true;
    }

    if (event.key === "c") {
        keys.c = true;
    }
  
    if (event.key === "d") {
        keys.d = true;
    }
    
    if (event.key === "e") {
      keys.e = true;
    }

    if (event.key === "f") {
        keys.f = true;
    }

    if (event.key === "g") {
        keys.g = true;
    }
  
    if (event.key === "h") {
        keys.h = true;
    }

    if (event.key === "i") {
        keys.i = true;
    }
  
    if (event.key === "j") {
        keys.j = true;
    }

    
// MOVES MADE 

// [1] INVESTIGATE!!!

  if(keys.k1 && keys.a){ //Investigate the Local Police
   
    prompt = "I would like to Investigate the Local Police";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }

  if(keys.k1 && keys.b){ //Investigate the Accused
   
    prompt = "I would like to Investigate the Accused";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }

  if(keys.k1 && keys.c){ //Investigate the Politicans
   
    prompt = "I would like to Investigate the Politicans";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }

  if(keys.k1 && keys.d){ //Investigate the Journalists
   
    prompt = "I would like to Investigate the Journalists";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }

  if(keys.k1 && keys.e){ //Investigate the Local Community
   
    prompt = "I would like to Investigate the Local Community";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }

  if(keys.k1 && keys.f){ //Investigate the Protesters
   
    prompt = "I would like to Investigate the Protesters";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }

  if(keys.k1 && keys.g){ //Investigate the Video Evidence
   
    prompt = "I would like to Investigate the Video Evidence";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }

  if(keys.k1 && keys.h){ //Investigate the Photo Evidence
   
    prompt = "I would like to Investigate the Photo Evidence";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }

  if(keys.k1 && keys.i){ //Investigate the CCTV Footage
   
    prompt = "I would like to Investigate the CCTV Footage";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }

  if(keys.k1 && keys.j){ //Investigate the Local Athorities
   
    prompt = "I would like to Investigate the Local Athorities";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }

// [2] INTERVIEW !!!

if(keys.k2 && keys.a){ //Interview the Local Police
   
    prompt = "I would like to Interview the Local Police";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }

  if(keys.k2 && keys.b){ //Interview the Accused
   
    prompt = "I would like to Interview the Accused";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }

  if(keys.k2 && keys.c){ //Interview the Politicans
   
    prompt = "I would like to Interview the Politicans";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }

  if(keys.k2 && keys.d){ //Interview the Journalists
   
    prompt = "I would like to Interview the Journalists";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }

  if(keys.k2 && keys.e){ //Interview the Local Community
   
    prompt = "I would like to Interview the Local Community";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }

  if(keys.k2 && keys.f){ //Interview the Protesters
   
    prompt = "I would like to Interview the Protesters";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }

  //if(keys.k2 && keys.g){ //INVALID [Interview the Video Evidence]


  //if(keys.k2 && keys.h){ //INVALID [Interview the Photo Evidence]


  //if(keys.k2 && keys.i){ //INVALID [ Interviewthe CCTV Footage]


  if(keys.k2 && keys.j){ //Interview the Local Athorities
   
    prompt = "I would like to Interview the Local Athorities";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }

// [3] CHECK WHATSAPP MESSAGE OF !!!

if(keys.k3 && keys.a){ //Check the Whatsapp Messages of the Local Police
   
    prompt = "I would like to Check the Whatsapp Messages of the Local Police";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }

  if(keys.k3 && keys.b){ //Check the Whatsapp Messages of the Accused
   
    prompt = "I would like to Check the Whatsapp Messages of the Accused";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }

  if(keys.k3 && keys.c){ //Check the Whatsapp Messages of the Politicans
   
    prompt = "I would like to Check the Whatsapp Messages of the Politicans";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }

  if(keys.k3 && keys.d){ //Check the Whatsapp Messages of the Journalists
   
    prompt = "I would like to Check the Whatsapp Messages of the Journalists";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }

  if(keys.k3 && keys.e){ //Check the Whatsapp Messages of the Local Community
   
    prompt = "I would like to Check the Whatsapp Messages of the Local Community";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }

  if(keys.k3 && keys.f){ //Check the Whatsapp Messages of the Protesters
   
    prompt = "I would like to Check the Whatsapp Messages of the Protesters";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }

  //if(keys.k3 && keys.g){ //INVALID [Check the Whatsapp Messages of the Video Evidence]


  //if(keys.k3 && keys.h){ //INVALID [Check the Whatsapp Messages of the Photo Evidence]
   

  //if(keys.k3 && keys.i){ //INVALID [ Check the Whatsapp Messages of the CCTV Footage]
   

  if(keys.k3 && keys.j){ //Check the Whatsapp Messages of the Local Athorities
   
    prompt = "I would like to Check the Whatsapp Messages of the Local Athorities";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }

// [4] REVERSE IMAGE SEARCH !!!

if(keys.k4 && keys.g){ //Reverse Image Search the Video Evidence
   
    prompt = "I would like to Reverse Image Search the Video Evidence";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }

if(keys.k4 && keys.h){ //Reverse Image Search the Photo Evidence
   
    prompt = "I would like to Reverse Image Search the Photo Evidence";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }

if(keys.k4 && keys.i){ //Reverse Image Search the CCTV Footage
   
    prompt = "I would like to Reverse Image Search the CCTV Footage";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }
  
// [5] CHECK SOCIAL MEDIA ACCOUNT OF !!!

if(keys.k5 && keys.a){ //Check the Social Media Accounts of the Local Police
   
    prompt = "I would like to Check the Social Media Accounts of the Local Police";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }

  if(keys.k5 && keys.b){ //Check the Social Media Accounts ofthe Accused
   
    prompt = "I would like to Check the Social Media Accounts of the Accused";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }

  if(keys.k5 && keys.c){ //Check the Social Media Accounts of the Politicans
   
    prompt = "I would like to Check the Social Media Accounts of the Politicans";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }

  if(keys.k5 && keys.d){ //Check the Social Media Accounts of the Journalists
   
    prompt = "I would like to Check the Social Media Accounts of the Journalists";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }

  if(keys.k5 && keys.e){ //Check the Social Media Accounts of the Local Community
   
    prompt = "I would like to Check the Social Media Accounts of the Local Community";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }

  if(keys.k5 && keys.f){ //Check the Social Media Accounts of the Protesters
   
    prompt = "I would like to Check the Social Media Accounts of the Protesters";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }

  //if(keys.k2 && keys.g){ //INVALID [Check the Social Media Accounts of the Video Evidence]


  //if(keys.k2 && keys.h){ //INVALID [Check the Social Media Accounts of the Photo Evidence]


  //if(keys.k2 && keys.i){ //INVALID [Check the Social Media Accounts of the CCTV Footage]


  if(keys.k5 && keys.j){ //Check the Social Media Accounts of the Local Athorities
   
    prompt = "I would like to Check the Social Media Accounts ofw the Local Athorities";
        if(messages.length==2){
            prompt = "Every time I respond, a day has passed, and a new update has taken place. For example, a riot has broken out; an international news agency has covered the event; a politician has been elected; a person has been killed, etc. The updates you give me should raise the suspense and tension. Then when I respond, answer with yes or no, why, and give me the update that has happened over the day. I have 7 days to find out the right answer."+prompt +"Tell me what Option I chose and the update on day 1 in a news format and ask me for my choice for the next day."
        }
        getAnswer();
  }
  
  });



  addEventListener("keyup", (event) => {
        if (event.key === "1") {
            keys.k1 = false;
          }
      
        if (event.key === "2") {
            keys.k2 = false;
        }
    
        if (event.key === "3") {
            keys.k3 = false;
        }
          
        if (event.key === "4") {
            keys.k4 = false;
        }
    
        if (event.key === "5") {
            keys.k5 = false;
        }
    
        if (event.key === "a") {
          keys.a = false;
        }
    
        if (event.key === "b") {
            keys.b = false;
        }
    
        if (event.key === "c") {
            keys.c = false;
        }
      
        if (event.key === "d") {
            keys.d = false;
        }
        
        if (event.key === "e") {
          keys.e = false;
        }
    
        if (event.key === "f") {
            keys.f = false;
        }
    
        if (event.key === "g") {
            keys.g = false;
        }
      
        if (event.key === "h") {
            keys.h = false;
        }
    
        if (event.key === "i") {
            keys.i = false;
        }
      
        if (event.key === "j") {
            keys.j = false;
        }


    });

    