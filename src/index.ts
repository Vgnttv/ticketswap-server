import { Action, BadRequestError, useKoaServer } from "routing-controllers";
import { verify } from "./jwt";
import { Server } from "http";
import { secret } from "./jwt";
import * as Koa from "koa";
import * as IO from "socket.io";
import * as socketIoJwtAuth from "socketio-jwt-auth";
import "reflect-metadata";
import setupDb from "./db";
import User from "./users/entity";
import UserController from "./users/controller";
import LoginController from "./logins/controller";
import EventController from "./events/controller";
import TicketController from "./tickets/controller";
import CommentController from "./comments/controller";


const app = new Koa();
const server = new Server(app.callback());
export const io = IO(server);
const port = process.env.PORT || 4000;

useKoaServer(app, {
  cors: true,
  controllers: [
    UserController,
    LoginController,
    EventController,
    TicketController,
    CommentController
  ],
  authorizationChecker: (action: Action) => {
    const header: string = action.request.headers.authorization;
    if (header && header.startsWith("Bearer ")) {
      const [, token] = header.split(" ");

      try {
        return !!(token && verify(token));
      } catch (error) {
        throw new BadRequestError(error);
      }
    }

    return false;
  },
  currentUserChecker: async (action: Action) => {
    const header: string = action.request.headers.authorization;
    if (header && header.startsWith("Bearer ")) {
      const [, token] = header.split(" ");

      if (token) {
        const { id } = verify(token);
        return User.findOneById(id);
      }
    }
    return undefined;
  },
  
});

io.use(
  socketIoJwtAuth.authenticate({ secret }, async (payload, done) => {
    const user = await User.findOneById(payload.id);
    if (user) done(null, user);
    else done(null, false, `Invalid JWT user ID`);
  })
);

io.on("connect", socket => {
  const name = socket.request.user.firstName;
  console.log(`User ${name} just connected`);

  socket.on("disconnect", () => {
    console.log(`User ${name} just disconnected`);
  });
});

setupDb()
  .then(_ => {
    server.listen(port);
    console.log(`Listening on port ${port}`);
  })
  .catch(err => console.error(err));
