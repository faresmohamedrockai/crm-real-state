// src/visit/visit.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { VisitsService } from './visits.service';
import { CreateVisitDto } from './dto/create-visits.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.gaurd';
import { Roles } from '../auth/Role.decorator';
import { Role } from '../auth/roles.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Post("create/:id")
  async createVisit(@Body() dto: CreateVisitDto, @Req() req) {
    const {userId,email,role}= req.user;
   
    
    const {id}=req.params
    return this.visitsService.createVisit(dto,userId,id,email,role);
  }

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Get(":id")
  async getAllVisits(@Req() req) {
    const { id: userId, name: userName, role: userRole } = req.user;
    const {id}=req.params
    return this.visitsService.getAllVisits(userId, userName, userRole,id);
  }

  

  // @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER)
  // @Patch(':id')
  // async updateVisit(
  //   @Param('id') id: string,
  //   @Body() dto: CreateVisitDto,
  //   @Req() req
  // ) {
  //   const { id: userId, name: userName, role: userRole } = req.user;
  //   return this.visitsService.updateVisit(id, dto, userId, userName, userRole);
  // }

  // @Roles(Role.ADMIN, Role.SALES_ADMIN)
  // @Delete(':id')
  // async deleteVisit(@Param('id') id: string, @Req() req) {
  //   const { id: userId, name: userName, role: userRole } = req.user;
  //   return this.visitsService.deleteVisit(id, userId, userName, userRole);
  // }
}
