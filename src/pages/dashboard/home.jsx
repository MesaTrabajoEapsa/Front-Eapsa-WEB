import React from "react";
import {
  Typography,
  Card,
  CardBody,
  Button,
} from "@material-tailwind/react";

export function Home() {
  return (
    <div className="mt-1 font-poppins bg-gradient-to-r via-white">
      <div className="max-w-6xl mx-auto py-8 px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="max-w-3xl mx-auto p-6 space-y-8">
  <div className="bg-blue-800 text-white shadow-xl rounded-2xl p-6">
    <Typography variant="h2" className="text-5xl md:text-4xl font-extrabold text-center">
      ¡!
    </Typography>
  </div>

  <div className="shadow-md rounded-2xl p-4">
    <Typography variant="h2" className="text-3xl md:text-4xl font-bold text-center text-blue-800">
      ¿?
    </Typography>

    <div className="space-y-4 mt-4">
      <Typography variant="lead" className="text-gray-700 text-lg leading-relaxed text-justify">
      
      </Typography>

      <Typography variant="lead" className="text-gray-700 text-lg leading-relaxed text-justify">
       
      </Typography>
    </div>
  </div>
</div>

        <div className="flex justify-center">
          <img
            src="/img/logoeapsa.jfif"
            alt="Imagen"
            className="object-cover w-full h-full rounded-lg shadow-lg transform hover:scale-105 transition duration-300"
          />
        </div>
      </div>
    </div>
  );
}

export default Home;