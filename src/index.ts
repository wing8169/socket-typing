// Import necessary modules
import { io } from "socket.io-client";
import robot from "robotjs";
import dotenv from "dotenv";

function extractTextFromMotionTag(inputString: string): string {
  // Define the regex to match text within <motion> tags
  const regex = /<motion>(.*?)<\/motion>/g;

  // Use regex to extract all matches
  const matches = [];
  let match;
  while ((match = regex.exec(inputString)) !== null) {
    matches.push(match[1]); // Capture group contains the text inside the tags
  }

  return matches?.[0] ?? "";
}

// Load environment variables
dotenv.config();

// Retrieve the socket server URL from the .env file
const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL;

if (!SOCKET_SERVER_URL) {
  console.error("Error: SOCKET_SERVER_URL is not defined in the .env file.");
  process.exit(1);
}

// Connect to the socket server
const socket = io(SOCKET_SERVER_URL);

// Listen to the 'connect' event
socket.on("connect", () => {
  console.log(`Connected to socket server at ${SOCKET_SERVER_URL}`);
});

const typeText = (v: string) => {
  try {
    robot.typeString(v); // Types the received text
    robot.keyTap("enter"); // Optionally, hit Enter after typing
  } catch (err) {
    console.error("Error typing message:", (err as Error).message);
  }
};

// Listen for messages on the 'uid' channel
socket.on(process.env.SOCKET_SERVER_CHANNEL ?? "", (message: string) => {
  console.log("Received message:", message);

  // Simulate typing the received text into a Notepad window
  typeText(extractTextFromMotionTag(message) || "idle");
});

// Listen for disconnection
socket.on("disconnect", () => {
  console.log("Disconnected from socket server");
});
