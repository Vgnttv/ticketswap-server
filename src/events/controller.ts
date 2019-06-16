import {
  JsonController,
  Authorized,
  Post,
  Param,
  HttpCode,
  Get,
  Body
} from "routing-controllers";
import { Event } from "./entities";

@JsonController()
export default class EventController {
  @Get("/events")
  getEvents() {
    return Event.find();
  }

  @Get("/events/:id([0-9]+)")
  getEvent(@Param("id") id: number) {
    return Event.findOneById(id);
  }

  @Authorized()
  @Post("/events")
  @HttpCode(201)
  createEvent(@Body() event: Event) {
    return event.save();
  }
}
