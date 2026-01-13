'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

import {
  FileText,
  Home,
  LogOut,
  PanelLeft,
  QrCode,
  Settings,
  Users,
  Usb,
  UserPlus,
  LayoutGrid,
} from 'lucide-react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { AppLogo } from '@/components/icons';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function DashboardSidebar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname.startsWith(path);

  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="group-data-[variant=sidebar]:bg-sidebar group-data-[variant=sidebar]:text-sidebar-foreground group-data-[variant=sidebar]:border-sidebar-border"
    >
      <SidebarHeader className="h-16 flex items-center gap-2 p-4">
        <AppLogo className="size-8 text-sidebar-primary" />
        <span className="text-xl font-bold font-headline text-sidebar-foreground group-data-[collapsible=icon]:hidden">
          QRAttendance
        </span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/dashboard'}
              tooltip="Panel de Control"
            >
              <Link href="/dashboard">
                <Home />
                <span>Panel de Control</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard/sections')}
              tooltip="Secciones"
            >
              <Link href="/dashboard/sections">
                <LayoutGrid />
                <span>Secciones</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard/students')}
              tooltip="Estudiantes"
            >
              <Link href="/dashboard/students">
                <Users />
                <span>Estudiantes</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard/person-registration')}
              tooltip="Registro de Personas"
            >
              <Link href="/dashboard/person-registration">
                <UserPlus />
                <span>Registro Personas</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard/scan')}
              tooltip="Escanear (Cámara)"
            >
              <Link href="/dashboard/scan">
                <QrCode />
                <span>Escaner Cámara</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard/keyboard-scan')}
              tooltip="Escanear (USB)"
            >
              <Link href="/dashboard/keyboard-scan">
                <Usb />
                <span>Escaner USB</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard/reports')}
              tooltip="Reportes"
            >
              <Link href="/dashboard/reports">
                <FileText />
                <span>Reportes</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 p-2 h-auto hover:bg-sidebar-accent"
            >
              {userAvatar && (
                <Image
                  className="rounded-full"
                  src={userAvatar.imageUrl}
                  alt="Avatar de usuario"
                  width={32}
                  height={32}
                  data-ai-hint={userAvatar.imageHint}
                />
              )}
              <div className="text-left group-data-[collapsible=icon]:hidden">
                <p className="font-medium text-sidebar-foreground">Admin</p>
                <p className="text-xs text-sidebar-foreground/70">
                  admin@example.com
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" sideOffset={12}>
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2" />
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <Link href="/">
              <DropdownMenuItem>
                <LogOut className="mr-2" />
                Cerrar Sesión
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function DashboardBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const translatedSegments: { [key: string]: string } = {
    dashboard: 'Panel de Control',
    sections: 'Secciones',
    students: 'Estudiantes',
    scan: 'Escaner Cámara',
    'keyboard-scan': 'Escaner USB',
    reports: 'Reportes',
    'person-registration': 'Registro de Personas',
  };

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">Panel de Control</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.slice(1).map((segment, index) => (
          <React.Fragment key={segment}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {index === segments.length - 2 ? (
                <BreadcrumbPage className="capitalize">
                  {translatedSegments[segment] || segment.replace('-', ' ')}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link
                    href={`/${segments.slice(0, index + 2).join('/')}`}
                    className="capitalize"
                  >
                    {translatedSegments[segment] || segment.replace('-', ' ')}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Alternar Menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs bg-sidebar text-sidebar-foreground border-sidebar-border p-0">
               <SidebarHeader className="h-16 flex items-center gap-2 p-4">
                <AppLogo className="size-8 text-sidebar-primary" />
                <span className="text-xl font-bold font-headline text-sidebar-foreground">
                  QRAttendance
                </span>
              </SidebarHeader>
              <nav className="grid gap-6 text-lg font-medium p-4">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-4 px-2.5 text-sidebar-foreground/70 hover:text-sidebar-foreground"
                >
                  <Home className="h-5 w-5" />
                  Panel de Control
                </Link>
                 <Link
                  href="/dashboard/sections"
                  className="flex items-center gap-4 px-2.5 text-sidebar-foreground/70 hover:text-sidebar-foreground"
                >
                  <LayoutGrid className="h-5 w-5" />
                  Secciones
                </Link>
                 <Link
                  href="/dashboard/students"
                  className="flex items-center gap-4 px-2.5 text-sidebar-foreground/70 hover:text-sidebar-foreground"
                >
                  <Users className="h-5 w-5" />
                  Estudiantes
                </Link>
                 <Link
                  href="/dashboard/person-registration"
                  className="flex items-center gap-4 px-2.5 text-sidebar-foreground/70 hover:text-sidebar-foreground"
                >
                  <UserPlus className="h-5 w-5" />
                  Registro Personas
                </Link>
                <Link
                  href="/dashboard/scan"
                  className="flex items-center gap-4 px-2.5 text-sidebar-foreground/70 hover:text-sidebar-foreground"
                >
                  <QrCode className="h-5 w-5" />
                  Escaner Cámara
                </Link>
                 <Link
                  href="/dashboard/keyboard-scan"
                  className="flex items-center gap-4 px-2.5 text-sidebar-foreground/70 hover:text-sidebar-foreground"
                >
                  <Usb className="h-5 w-5" />
                  Escaner USB
                </Link>
                <Link
                  href="/dashboard/reports"
                  className="flex items-center gap-4 px-2.5 text-sidebar-foreground/70 hover:text-sidebar-foreground"
                >
                  <FileText className="h-5 w-5" />
                  Reportes
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <DashboardBreadcrumb />
          <div className="relative ml-auto flex-1 md:grow-0" />
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
              {userAvatar && (
                <Image
                  src={userAvatar.imageUrl}
                  width={36}
                  height={36}
                  alt="Avatar"
                  className="overflow-hidden rounded-full"
                  data-ai-hint={userAvatar.imageHint}
                />
              )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Configuración</DropdownMenuItem>
              <DropdownMenuSeparator />
              <Link href="/">
                <DropdownMenuItem>Cerrar Sesión</DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
