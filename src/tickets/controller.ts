import {
  JsonController,
  Get,
  Param,
  Put,
  Body,
  NotFoundError,
  Post,
  HttpCode,
  Authorized,
  CurrentUser
} from "routing-controllers";
import { Ticket } from "./entity";
import User from "../users/entity";
import { Event } from "../events/entities";
// import { io } from "../index";

@JsonController()
export default class TicketController {
  @Get("/tickets")
  getTickets() {
    return Ticket.find();
  }

  @Get("/tickets/:id")
  getTicket(@Param("id") id: number) {
    return Ticket.findOneById(id);
  }

  @Authorized()
  @Post("/tickets")
  @HttpCode(201)
  async createTicket(@Body() ticket: Ticket, @CurrentUser() user: User) {
    const entity = await Ticket.create({
      user,
      price: ticket.price,
      description: ticket.description,
      picture: ticket.picture,
      userId: ticket.userId,
      eventId: ticket.eventId
    }).save();

    const thisTicket = await Ticket.findOneById(entity.id);
    const thisTicketEvent = await Event.find().then(response =>
      response.find(event => event.id === thisTicket.eventId)
    );
    const userTickets = user.tickets.length;

    async function fraudRisk(ticket = thisTicket) {
      function tqRisk() {
        if (userTickets <= 1) {
          const ticketQuantityRisk = 10;
          return ticketQuantityRisk;
        } else {
          const ticketQuantityRisk = 0;
          return ticketQuantityRisk;
        }
      }
      async function timeRisk() {
        const time = await ticket.createdDate.getHours();
        if (time > 8 && time < 18) {
          const timerisk = -10;
          return timerisk;
        } else {
          const timerisk = 10;
          return timerisk;
        }
      }

      async function priceRisk() {
        const ticketTotalPrice = await thisTicketEvent.tickets.reduce(
          (totalSoFar, currentTicket) => {
            return totalSoFar + currentTicket.price;
          },
          0
        );
        const ticketsAveragePrice =
          (await ticketTotalPrice) / (await thisTicketEvent.tickets.length);
        console.log("ticketTotalPrice", ticketTotalPrice);

        console.log("ticketsAveragePrice", ticketsAveragePrice);
        if (ticket.price < ticketsAveragePrice) {
          const priceDiff = ticketsAveragePrice - ticket.price;
          const priceDiffPercentage = (priceDiff / ticketsAveragePrice) * 100;
          console.log("priceDiffPercentage", priceDiffPercentage);
          return Math.floor(priceDiffPercentage);
        }
        if (ticket.price > ticketsAveragePrice) {
          const priceMoreDiff = ticket.price - ticketsAveragePrice;
          const priceMorePercentage =
            (priceMoreDiff / ticketsAveragePrice) * 100;
          if (priceMorePercentage > 10) {
            const priceMorePercentage = -10;
            return priceMorePercentage;
          } else {
            console.log("priceMorePercentage", priceMorePercentage);
            return Math.floor(-priceMorePercentage);
          }
        } else {
          return 0;
        }
      }

      const ticketQuantityRisk = await tqRisk();
      console.log("TicketQuantityRisk", ticketQuantityRisk);
      const ticketTimeRisk = await timeRisk();
      console.log("ticketTimeRisk", ticketTimeRisk);
      const priceTicketRisk = await priceRisk();
      console.log("priceTicketRisk", priceTicketRisk);
      let fraudR =
        (await priceTicketRisk) +
        (await ticketQuantityRisk) +
        (await ticketTimeRisk);
      function parRisk() {
        if (fraudR < 5) {
          fraudR = 5;
          return fraudR;
        } else if (fraudR > 95) {
          fraudR = 95;
          return fraudR;
        }
        return fraudR;
      }
      await parRisk();
      console.log("fraudR", fraudR);
      return fraudR;
    }

    await fraudRisk().then(response => (ticket.fraudrisk = response));
    await thisTicketEvent.tickets.map(ticket => {
      fraudRisk(ticket).then(response => {
        ticket.fraudrisk = response;
      });
      return ticket.save();
    });

    return await thisTicket.save();
  }

  @Authorized()
  @Put("/tickets/:id")
  async updateTicket(@Param("id") id: number, @Body() update: Partial<Ticket>) {
    const ticket = await Ticket.findOneById(id);
    if (!ticket) throw new NotFoundError("Cannot find ticket");
    return Ticket.merge(ticket, update).save();
  }
}
