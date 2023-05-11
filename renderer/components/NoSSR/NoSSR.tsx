import dynamic from "next/dynamic";
import React from "react";

export default dynamic(() => import("../KonvaCanvas/KonvaCanvas"), {
  ssr: false,
});
