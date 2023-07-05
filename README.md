# Large Language Objects  

Example project that connects Arduino, p5js and GPT under an Electron shell.

## How to Run this App


### 1. Arduino

Start by programming your Arduino with the code in the folder A_Electron.

Check what port your Arduino is connected to under Tools > Port. You can also do this in Terminal by using the command: ls /dev/tty.*

Enter the port name in sketch.js in this line:
sp = new SerialPort({ path: '/dev/tty.usbmodem14201', baudRate: 115200 });



### 2. OpenAI API Key

Create an account with OpenAI, and generate an API key here:
https://platform.openai.com/account/api-keys

Enter your API key in key.js: OPENAI_API_KEY='Your API Key Here' 

(Remember to keep it secret and not share it on Github)




### 3. Run the Electon App

To run the Electron app, install node.js https://nodejs.org/en

Using the terminal, navigate to the project folder and run:

npm install

npm start

sketch.js contains all the logic required to run your app.

When the app first runs, the canvas background is grey and makes a request to GPT using the following prompt: 
let prompt = "the hex code for color 'bright pink' is";

Once it receives the first response it updates the background color to a pink color received from GPT.

By pressing the letter 'A', you can do another request with the prompt 'fire red' and color the background with the response color. By pressing the letter 'B', you can color it with 'morning sky'.

To communicate with Arduino, you can press 'H' or 'L'. Electron will send a character to Arduino which will toggle the onboard LED on or off. You will also get a response from Arduino that will get showed on the app canvas. 
