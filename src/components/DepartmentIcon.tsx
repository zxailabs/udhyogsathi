"use client";

import React from "react";
import {
  Building2,
  Factory,
  FileCheck2,
  Globe2,
  Landmark,
  Newspaper,
  Rocket,
  ShieldAlert,
  Users,
} from "lucide-react";

interface DepartmentIconProps {
  name: string;
  className?: string;
}

export function DepartmentIcon({ name, className = "w-5 h-5" }: DepartmentIconProps) {
  switch (name) {
    case "Factory":
      return <Factory className={className} />;
    case "Landmark":
      return <Landmark className={className} />;
    case "Building2":
      return <Building2 className={className} />;
    case "Rocket":
      return <Rocket className={className} />;
    case "FileCheck2":
      return <FileCheck2 className={className} />;
    case "Globe2":
      return <Globe2 className={className} />;
    case "Users":
      return <Users className={className} />;
    case "Newspaper":
      return <Newspaper className={className} />;
    case "ShieldAlert":
      return <ShieldAlert className={className} />;
    default:
      return <Factory className={className} />;
  }
}

