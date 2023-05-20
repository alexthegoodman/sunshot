import dynamic from "next/dynamic";
import React from "react";

export default dynamic(() => import("../Tracks/Tracks"), {
  ssr: false,
});
