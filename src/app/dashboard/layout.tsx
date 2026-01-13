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
  GraduationCap,
  CalendarClock,
  CalendarDays,
  Building,
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

  // Refined active styling: left border + subtle gradient + text glow
  const activeClass = "data-[active=true]:bg-blue-600/10 data-[active=true]:text-blue-400 data-[active=true]:border-l-4 data-[active=true]:border-blue-500 data-[active=true]:rounded-r-lg data-[active=true]:rounded-l-none";
  const hoverClass = "hover:bg-white/5 hover:text-white transition-all duration-300";

  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="border-r border-white/5 bg-[#0b1121] text-sidebar-foreground shadow-2xl"
    >
      <SidebarHeader className="h-20 flex items-center justify-center border-b border-white/5 pb-4 pt-6">
        <div className="flex items-center gap-3 transition-opacity duration-300 group-data-[collapsible=icon]:opacity-100">
          <div className="flex items-center justify-center p-2 bg-blue-600/20 rounded-xl ring-1 ring-blue-500/30">
            <AppLogo className="size-8 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-xl font-bold tracking-tight text-white font-headline">
              QRAttendance
            </span>
            <span className="text-[10px] text-blue-300/60 uppercase tracking-widest font-semibold">
              Admin Console
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-6 no-scrollbar">
        <SidebarMenu className="gap-2">
          {/* Main Dashboard */}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/dashboard'}
              tooltip="Panel de Control"
              className={`${activeClass} ${hoverClass} h-11`}
            >
              <Link href="/dashboard">
                <Home className="size-5 opacity-80" />
                <span className="font-medium tracking-wide">Panel de Control</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <div className="h-px bg-white/5 my-2 mx-2 group-data-[collapsible=icon]:hidden" />
          <span className="px-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider group-data-[collapsible=icon]:hidden">
            Gestión Académica
          </span>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard/institutions')}
              tooltip="Instituciones"
              className={`${activeClass} ${hoverClass} h-11`}
            >
              <Link href="/dashboard/institutions">
                <Building className="size-5 opacity-80" />
                <span className="font-medium tracking-wide">Instituciones</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard/academic-year')}
              tooltip="Año Académico"
              className={`${activeClass} ${hoverClass} h-11`}
            >
              <Link href="/dashboard/academic-year">
                <CalendarClock className="size-5 opacity-80" />
                <span className="font-medium tracking-wide">Año Académico</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard/periods')}
              tooltip="Periodos"
              className={`${activeClass} ${hoverClass} h-11`}
            >
              <Link href="/dashboard/periods">
                <CalendarDays className="size-5 opacity-80" />
                <span className="font-medium tracking-wide">Periodos</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard/grades')}
              tooltip="Grados"
              className={`${activeClass} ${hoverClass} h-11`}
            >
              <Link href="/dashboard/grades">
                <GraduationCap className="size-5 opacity-80" />
                <span className="font-medium tracking-wide">Grados</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard/sections')}
              tooltip="Secciones"
              className={`${activeClass} ${hoverClass} h-11`}
            >
              <Link href="/dashboard/sections">
                <LayoutGrid className="size-5 opacity-80" />
                <span className="font-medium tracking-wide">Secciones</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <div className="h-px bg-white/5 my-2 mx-2 group-data-[collapsible=icon]:hidden" />
          <span className="px-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider group-data-[collapsible=icon]:hidden">
            Estudiantes
          </span>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard/students')}
              tooltip="Estudiantes"
              className={`${activeClass} ${hoverClass} h-11`}
            >
              <Link href="/dashboard/students">
                <Users className="size-5 opacity-80" />
                <span className="font-medium tracking-wide">Estudiantes</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard/person-registration')}
              tooltip="Registro de Personas"
              className={`${activeClass} ${hoverClass} h-11`}
            >
              <Link href="/dashboard/person-registration">
                <UserPlus className="size-5 opacity-80" />
                <span className="font-medium tracking-wide">Registro Personas</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <div className="h-px bg-white/5 my-2 mx-2 group-data-[collapsible=icon]:hidden" />
          <span className="px-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider group-data-[collapsible=icon]:hidden">
            Operaciones
          </span>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard/scan')}
              tooltip="Escanear (Cámara)"
              className={`${activeClass} ${hoverClass} h-11`}
            >
              <Link href="/dashboard/scan">
                <QrCode className="size-5 opacity-80" />
                <span className="font-medium tracking-wide">Escaner Cámara</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard/keyboard-scan')}
              tooltip="Escanear (USB)"
              className={`${activeClass} ${hoverClass} h-11`}
            >
              <Link href="/dashboard/keyboard-scan">
                <Usb className="size-5 opacity-80" />
                <span className="font-medium tracking-wide">Escaner USB</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard/reports')}
              tooltip="Reportes"
              className={`${activeClass} ${hoverClass} h-11`}
            >
              <Link href="/dashboard/reports">
                <FileText className="size-5 opacity-80" />
                <span className="font-medium tracking-wide">Reportes</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-white/5 bg-black/10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 p-3 h-auto hover:bg-white/5 transition-colors rounded-xl border border-transparent hover:border-white/5"
            >
              {userAvatar && (
                <div className="relative">
                  <Image
                    className="rounded-full ring-2 ring-blue-500/20"
                    src={userAvatar.imageUrl}
                    alt="Avatar de usuario"
                    width={36}
                    height={36}
                    data-ai-hint={userAvatar.imageHint}
                  />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#0b1121] animate-pulse" />
                </div>
              )}
              <div className="text-left group-data-[collapsible=icon]:hidden flex-1 overflow-hidden">
                <p className="font-bold text-sm text-white truncate">Admin User</p>
                <p className="text-[11px] text-blue-300/50 truncate font-mono">
                  admin@education.com
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" sideOffset={12} className="w-56 glass-card border-white/10 p-2">
            <DropdownMenuLabel className="text-xs font-semibold text-blue-200/60 uppercase tracking-wider px-2 py-1.5">Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem className="focus:bg-blue-600 focus:text-white rounded-lg cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <Link href="/">
              <DropdownMenuItem className="focus:bg-red-500/20 focus:text-red-400 text-red-400 rounded-lg cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
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
    institutions: 'Instituciones',
    'academic-year': 'Año Académico',
    periods: 'Periodos',
    grades: 'Grados',
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
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Panel de Control</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.slice(1).map((segment, index) => (
          <React.Fragment key={segment}>
            <BreadcrumbSeparator className="text-muted-foreground/60" />
            <BreadcrumbItem>
              {index === segments.length - 2 ? (
                <BreadcrumbPage className="capitalize text-foreground font-medium">
                  {translatedSegments[segment] || segment.replace('-', ' ')}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link
                    href={`/${segments.slice(0, index + 2).join('/')}`}
                    className="capitalize text-muted-foreground hover:text-foreground transition-colors"
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
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/5 bg-background/60 backdrop-blur-xl px-6 transition-all">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" className="sm:hidden text-white hover:bg-white/10">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Alternar Menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs bg-sidebar text-sidebar-foreground border-r border-white/10 p-0">
              <SidebarHeader className="h-16 flex items-center gap-2 p-4 border-b border-white/10">
                <div className="flex items-center justify-center p-1.5 bg-blue-600/20 rounded-lg ring-1 ring-blue-500/20">
                  <AppLogo className="size-6 text-blue-400" />
                </div>
                <span className="text-xl font-bold font-headline text-sidebar-foreground">
                  QRAttendance
                </span>
              </SidebarHeader>
              <nav className="grid gap-2 text-lg font-medium p-4 overflow-y-auto max-h-[calc(100vh-64px)]">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-4 px-4 py-2 text-sidebar-foreground/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Home className="h-5 w-5" />
                  Panel de Control
                </Link>
                <Link
                  href="/dashboard/institutions"
                  className="flex items-center gap-4 px-4 py-2 text-sidebar-foreground/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Building className="h-5 w-5" />
                  Instituciones
                </Link>
                <Link
                  href="/dashboard/academic-year"
                  className="flex items-center gap-4 px-4 py-2 text-sidebar-foreground/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <CalendarClock className="h-5 w-5" />
                  Año Académico
                </Link>
                <Link
                  href="/dashboard/periods"
                  className="flex items-center gap-4 px-4 py-2 text-sidebar-foreground/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <CalendarDays className="h-5 w-5" />
                  Periodos
                </Link>
                <Link
                  href="/dashboard/grades"
                  className="flex items-center gap-4 px-4 py-2 text-sidebar-foreground/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <GraduationCap className="h-5 w-5" />
                  Grados
                </Link>
                <Link
                  href="/dashboard/sections"
                  className="flex items-center gap-4 px-4 py-2 text-sidebar-foreground/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <LayoutGrid className="h-5 w-5" />
                  Secciones
                </Link>
                <Link
                  href="/dashboard/students"
                  className="flex items-center gap-4 px-4 py-2 text-sidebar-foreground/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Users className="h-5 w-5" />
                  Estudiantes
                </Link>
                <Link
                  href="/dashboard/person-registration"
                  className="flex items-center gap-4 px-4 py-2 text-sidebar-foreground/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <UserPlus className="h-5 w-5" />
                  Registro Personas
                </Link>
                <Link
                  href="/dashboard/scan"
                  className="flex items-center gap-4 px-4 py-2 text-sidebar-foreground/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <QrCode className="h-5 w-5" />
                  Escaner Cámara
                </Link>
                <Link
                  href="/dashboard/keyboard-scan"
                  className="flex items-center gap-4 px-4 py-2 text-sidebar-foreground/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Usb className="h-5 w-5" />
                  Escaner USB
                </Link>
                <Link
                  href="/dashboard/reports"
                  className="flex items-center gap-4 px-4 py-2 text-sidebar-foreground/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
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
                variant="ghost"
                size="icon"
                className="overflow-hidden rounded-full ring-2 ring-white/10 hover:ring-blue-500/50 transition-all"
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
            <DropdownMenuContent align="end" className="glass-card border-white/10">
              <DropdownMenuLabel className="text-white">Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="focus:bg-blue-600 focus:text-white cursor-pointer">Configuración</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <Link href="/">
                <DropdownMenuItem className="focus:bg-red-500/20 focus:text-red-400 text-red-400 cursor-pointer">Cerrar Sesión</DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-6 p-6 sm:px-8 sm:py-6 relative z-10">
          {/* Gradient Orbs for background ambiance */}
          <div className="fixed top-20 left-64 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
          <div className="fixed bottom-10 right-10 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none -z-10" />

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
