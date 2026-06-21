import { Controller, Get, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  @Roles('admin', 'superadmin')
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  @Roles('admin', 'superadmin')
  async getUsers(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers(Number(page), Number(limit), search);
  }

  @Patch('users/:id/role')
  @Roles('admin', 'superadmin')
  async updateUserRole(
    @Param('id') id: string,
    @Body('role') role: 'user' | 'admin' | 'superadmin',
  ) {
    return this.adminService.updateUserRole(id, role);
  }

  @Delete('users/:id')
  @Roles('admin', 'superadmin')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Get('resources')
  @Roles('admin', 'superadmin')
  async getResources(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
  ) {
    return this.adminService.getResources(Number(page), Number(limit), search);
  }

  @Delete('resources/:id')
  @Roles('admin', 'superadmin')
  async deleteResource(@Param('id') id: string) {
    return this.adminService.deleteResource(id);
  }

  @Get('reports')
  @Roles('admin', 'superadmin')
  async getReports(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.adminService.getReports(Number(page), Number(limit));
  }

  @Patch('reports/:id/resolve')
  @Roles('admin', 'superadmin')
  async resolveReport(@Param('id') id: string) {
    return this.adminService.resolveReport(id);
  }
}
