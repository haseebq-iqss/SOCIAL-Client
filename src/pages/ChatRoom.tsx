import React from "react";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import "./styles/ChatRoomStyles.scss";
import { FormatTimeAgo } from "../utils/DateFormatter";
import { SocketRef } from "../types/SocketTypes";

interface locationStateTypes {
  name: string;
  room: string | number;
}

interface MessageBodyTypes {
  name: string;
  message: string;
  time: number;
}

const ChatRoom = () => {
  const location = useLocation();
  const { name, room }: locationStateTypes = location.state;

  // const socketURL: string = "http://localhost:5000";
  const socketURL: string = "https://social-server-317n.onrender.com";

  const [activeUsers, setActiveUsers] = React.useState<number>(0);
  const [messageList, setMessageList] = React.useState<Array<any>>([]);
  const [message, setMessage] = React.useState<string>("");

  const socket: SocketRef = React.useRef(null);

  const ScrollToBottom = () => {
    const scrollDelay = setInterval(() => {
      if (messageList.length > 4) {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }
      return clearInterval(scrollDelay);
    }, 100);
  };

  const SendMessage = () => {
    if (message?.length > 1) {
      const messageBody: MessageBodyTypes = {
        name,
        message,
        time: Date.now(),
      };
      socket?.current?.emit("messages", messageBody);
      setMessageList((prevState) => [...prevState, messageBody]);
      setMessage("");
    } else {
      alert("Cannot send a empty message!");
    }
  };

  const wait = (cb: () => void, time: number) => {
    const tOut = setTimeout(() => {
      cb()
      return clearInterval(tOut)
    }, time * 1000)
  }

  React.useEffect(() => {
    ScrollToBottom();
  }, [messageList])

  React.useEffect(() => {
    if (!socket.current) {
      socket.current = io(socketURL)

      socket.current.emit("join-room", room, name);

      socket.current.on("active-connections", (conns: number) => {
        setActiveUsers(conns);
      });

      socket.current.on("messages", (messageBody: string) => {
        setMessageList((prevState) => [...prevState, messageBody]);
      });
    }


    // OFFLINE MESSAGE
    // let isOffline: any;
    // activeUsers < 1 &&
    //   (isOffline = setTimeout(() => {
    //     let messageBody: MessageBodyTypes = {
    //       name: "SOCIAL",
    //       message: `Hi ${name}`,
    //       time: Date.now(),
    //     };
    //     console.log(messageBody)
    //     setMessageList((prevState) => [...prevState, messageBody]);
    //     messageBody.message = "The server seems to be offline ..."
    //     console.log(messageBody)
    //     setMessageList((prevState) => [...prevState, messageBody]);
    //     return clearInterval(isOffline)
    //   }, 7 * 1000))

    wait(
      () => {
        let messageBody: MessageBodyTypes = {
          name: "SOCIAL",
          message: `Hi ${name}`,
          time: Date.now(),
        };
        setMessageList((prevState) => [...prevState, messageBody]);
      },
      6
    )

    wait(
      () => {
        let messageBody: MessageBodyTypes = {
          name: "SOCIAL",
          message: `The server seems to be offline`,
          time: Date.now(),
        };
        setMessageList((prevState) => [...prevState, messageBody]);
      },
      8
    )

    wait(
      () => {
        let messageBody: MessageBodyTypes = {
          name: "SOCIAL",
          message: '😓',
          time: Date.now(),
        };
        setMessageList((prevState) => [...prevState, messageBody]);
      },
      10
    )

    // Clean up the socket connection when the component unmounts
    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, [room]);


  // REQS
  // Handle the Joining and leaving of a Room on the backend. DONE
  // Handle the Size Reponse of the Room so it can be accurate. DONE
  // Handle Time sent to the MessageBody so it can be read on the front end properly. DONE
  // Work on the Live Status of the User/Connection.

  return (
    <>
      <div className="chatroom-container">
        {/* HEADER NAV */}
        <nav>
          <h3>
            Room {"->"} ({room})
          </h3>
          <h3>
            You {"->"} ({name})
          </h3>
          <h3>
            Online {"->"} ({activeUsers})
          </h3>
        </nav>

        {/* BODY */}
        <div className="chatBody">
          {/* CHAT PILL */}
          {messageList.length > 0 &&
            messageList.map((message, index) => {
              return (
                <div
                  key={message.time}
                  className={`chat-pill ${message.name === name && "myMessage"
                    } ${index + 1 === messageList.length && " lastMessage"}`}
                >
                  <h5>{message.name}</h5>
                  <h4>{message.message}.</h4>
                  <h6>{FormatTimeAgo(message.time)}</h6>
                </div>
              );
            })}

          {/* INPUT BOX */}
          <div
            onKeyDown={(e) => e.key === "Enter" && SendMessage()}
            className="inputBox"
          >
            <input
              value={message}
              onChange={(e: any) => setMessage(e.target.value)}
              type="text"
              placeholder="Type youe message here ...."
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatRoom;
