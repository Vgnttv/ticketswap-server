import {
  JsonController,
  Authorized,
  Post,
  Param,
  HttpCode,
  NotFoundError,
  Get,
  Put,
  Body,
  CurrentUser
} from "routing-controllers";
import { Comment } from "./entity";
import User from "../users/entity";
import { Ticket } from "../tickets/entity";
// import { io } from "../index";

@JsonController()
export default class CommentController {
  @Get("/comments")
  getComments() {
    return Comment.find();
  }

  @Get("/comments/:id([0-9]+)")
  getComment(@Param("id") id: number) {
    return Comment.findOneById(id);
  }

  @Authorized()
  @Post("/comments")
  @HttpCode(201)
  async createComment(@Body() comment: Comment, @CurrentUser() user: User) {
    const entity = await Comment.create({
      user,
      comment: comment.comment,
      userId: comment.userId,
      ticketId: comment.ticketId
    }).save();
    const thisComment = await Comment.findOneById(entity.id);
    const thisCommentTicket = await Ticket.find().then(response =>
      response.find(ticket => ticket.id === thisComment.ticketId)
    );
    async function tcRisk() {
      if (thisCommentTicket.comments.length > 3) {
        const commentRisk = 5;
        return commentRisk;
      } else {
        const commentRisk = 0;
        return commentRisk;
      }
    }
    await tcRisk().then(response => {
      thisCommentTicket.fraudrisk += response;
      thisCommentTicket.save();
    });
    return await comment.save();
  }
 


  @Authorized()
  @Put("/comments/:id")
  async updateComment(
    @Param("id") id: number,
    @Body() update: Partial<Comment>
  ) {
    const comment = await Comment.findOneById(id);
    if (!comment) throw new NotFoundError("Cannot find comment");

    return Comment.merge(comment, update).save();
  }
}
