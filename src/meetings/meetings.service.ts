import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';

@Injectable()
export class MeetingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logsService: LogsService,
  ) { }

  async createMeeting(
    dto: CreateMeetingDto,
    userId: string,
    email: string,
    role: string,
  ) {
    const meeting = await this.prisma.meeting.create({
      data: {
        // الحقول الأساسية
        title: dto.title,
        client: dto.client,
        date: dto.date ? dto.date : null,
        time: dto.time,
        duration: dto.duration,
        type: dto.type,
        status: dto.status,
        locationType: dto.locationType,
        notes: dto.notes,
        objections: dto.objections,
        location: dto.location,

       
        ...(dto.inventoryId && {
          inventory: {
            connect: { id: dto.inventoryId },
          },
        }),
        ...(dto.projectId && {
          project: {
            connect: { id: dto.projectId },
          },
        }),
        ...(dto.assignedToId && {
          assignedTo: {
            connect: { id: dto.assignedToId },
          },
        }),

        // المستخدم المنشئ
        createdBy: {
          connect: { id: userId },
        },
      },
      include: {
        lead: true,
        inventory: true,
        project: true,
        assignedTo: true,
        createdBy: true,
      },
    });

    // // سجل عملية الإنشاء
    // await this.logsService.createLog({
    //   userId,
    //   email,
    //   userRole: role,
    //   leadId: dto.leadId || null,
    //   action: 'create_meeting',
    //   description: `Created meeting: ${dto.title || ''} for lead ${dto.leadId || 'N/A'}`,
    // });

    return {
      status: 201,
      message: 'Meeting created successfully',
      meetings: meeting,
    };
  }









  async getAllMeetings(
    userId: string,
    email: string,
    role: string,
  ) {
    const meetings = await this.prisma.meeting.findMany({
      include: {
        lead: true,
        inventory: true,
        project: true,
        createdBy: true,
        assignedTo: true, // ✅ إضافة الحقل الجديد
      },
      orderBy: {
        createdAt: 'desc',
      },
    });


    return {
      status: 200,
      message: 'Meetings retrieved successfully',
      meetings: meetings,
    };
  }


























  async updateMeeting(
    id: string,
    dto: UpdateMeetingDto,
    userId: string,
    email: string,
    role: string,
  ) {
    // 1. تحقق من وجود الاجتماع
    const existingMeeting = await this.prisma.meeting.findUnique({
      where: { id },
    });

    if (!existingMeeting) {
      throw new NotFoundException('Meeting not found');
    }

    // 2. تنفيذ التحديث بالحقول الموجودة فقط
    const updatedMeeting = await this.prisma.meeting.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.client && { client: dto.client }),
        ...(dto.date && { date: dto.date }),
        ...(dto.time && { time: dto.time }),
        ...(dto.duration && { duration: dto.duration }),
        ...(dto.type && { type: dto.type }),
        ...(dto.status && { status: dto.status }),
        ...(dto.locationType && { locationType: dto.locationType }),
        ...(dto.notes && { notes: dto.notes }),
        ...(dto.objections && { objections: dto.objections }),
        ...(dto.location && { location: dto.location }),

       
        ...(dto.inventoryId && {
          inventory: { connect: { id: dto.inventoryId } },
        }),
        ...(dto.projectId && {
          project: { connect: { id: dto.projectId } },
        }),
        ...(dto.assignedToId && {
          assignedTo: { connect: { id: dto.assignedToId } },
        }),
      },
      include: {
        lead: true,
        inventory: true,
        project: true,
        createdBy: true,
        assignedTo: true,
      },
    });

    // 3. تسجيل التحديث في السجل (logs)
    const log = await this.prisma.log.create({
      data: {
        user: {
          connect: {
            id: userId, // تأكد أن هذا موجود في المتغيرات
          },
        },
       
        email,
       userRole: role,
        action: 'update_meeting',
        description: `Updated meeting : status=${dto.status}, date=${dto.date}`,
     
      },
    });


    // 4. الإرجاع
    return {
      status: 200,
      message: 'Meeting updated successfully',
      meetings: updatedMeeting,
    };
  }












  async deleteMeeting(id: string, userId: string, email: string, role: string) {
    const existingMeeting = await this.prisma.meeting.findUnique({ where: { id } });
    if (!existingMeeting) {
      throw new NotFoundException('Meeting not found');
    }

    await this.prisma.meeting.delete({ where: { id } });

    // Log meeting deletion
   const log = await this.prisma.log.create({
  data: {
    user: {
      connect: {
        id: "755d6c75-fd02-429b-9adf-c9c560f08957",
      },
    },
    userName: undefined,
    userRole: "admin",
    action: "delete_meeting",
    description: "Deleted meeting 7bfe99b4-ee23-4a60-8180-b210090358ef for lead bb21cb68-5fa0-4c58-a553-e533fb40f9f1",
    ip: undefined,
    userAgent: undefined,
    lead: {
      connect: {
        id: "bb21cb68-5fa0-4c58-a553-e533fb40f9f1",
      },
    },
  },
});


    return {
      status: 200,
      message: 'Meeting deleted successfully',
    };
  }


} 