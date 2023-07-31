import dynamic from "next/dynamic";
import React from "react";

export default dynamic(() => import("../KonvaCanvas2/KonvaCanvas2"), {
  ssr: false,
});
