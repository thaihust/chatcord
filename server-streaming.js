const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const multer = require('multer');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const botName = 'ChatCord Bot';

// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

// Multer config
const multerConfig = {

  //specify diskStorage (another option is memory)
  storage: multer.diskStorage({

    //specify destination
    destination: function(req, file, next){
      next(null, './public/storage');
    },

    //specify the filename to be unique
    filename: function(req, file, next){
      console.log(file);
      //get the file mimetype ie 'image/jpeg' split and prefer the second value ie'jpeg'
      const ext = file.mimetype.split('/')[1];
      //set the file fieldname to a unique name containing the original name, current datetime and the extension.
      next(null, file.fieldname + '-' + Date.now() + '.'+ext);
    }
  }),

  //// filter out and prevent non-image files.
  //fileFilter: function(req, file, next){
  //      if(!file){
  //        next();
  //      }

  //    // only permit image mimetypes
  //    const image = file.mimetype.startsWith('image/');
  //    if(image){
  //      console.log('photo uploaded');
  //      next(null, true);
  //    }else{
  //      console.log("file not supported")
  //      //TODO:  A better message response to user on failure.
  //      return next();
  //    }
  //}
};

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', require('./routes/index'));

app.use('/streaming', require('./routes/streaming'));

app.post('/upload', multer(multerConfig).single('_file'),function(req, res){
    //Here is where I could add functions to then get the url of the new photo
    //And relocate that to a cloud storage solution with a callback containing its new url
    //then ideally loading that into your database solution.   Use case - user uploading an avatar...
    res.send('Complete! Check out your public/storage folder.  Please note that files not encoded with an image mimetype are rejected. <a href="upload.html">try again</a>');
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
