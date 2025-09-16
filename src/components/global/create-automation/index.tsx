"use client";
import { Button } from "@/components/ui/button";
import { AutomationDuoToneWhite } from "@/icons";
import React, { useMemo } from "react";
import { v4 } from "uuid";
import Loader from "../loader";

type Props = {};

function CreateAutomation({}: Props) {
  const mutationId = useMemo(
    () => v4(),
    [
      /* v4() */
    ]
  );
  //console.log("🚀 ~ CreateAutomation ~ mutationId:", mutationId);



  return (
    <Button
      className="lg:px-10 py-6 bg-gradient-to-br hover:opacity-80 text-white rounded-full from-[#3352CC] font-medium to-[#1C2D70]"
    >
      <Loader state={false} />
      <AutomationDuoToneWhite />
      <p className="lg:inline hidden">Create Automation</p>
    </Button>
  );
}

export default CreateAutomation;

// 04.40