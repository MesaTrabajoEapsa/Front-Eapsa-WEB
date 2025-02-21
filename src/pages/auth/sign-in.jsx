import React, { useState, useEffect } from "react";
import {
  Card,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "@/context/authContext";
import { debounce } from 'lodash';

export function SignIn() {
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [nombreError, setNombreError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  const { login, updatePermissions } = useAuth();

  const validateNombre = debounce((value) => {
    if (!value) {
      setNombreError("El campo nombre es obligatorio.");
    } else if (value.length < 3 || value.length > 50) {
      setNombreError("El nombre debe tener entre 3 y 50 caracteres.");
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
      setNombreError("El nombre solo puede contener letras y espacios.");
    } else if (/\s{2,}/.test(value)) {
      setNombreError("El nombre no puede contener múltiples espacios seguidos.");
    } else {
      setNombreError(""); 
    }
  }, 300);
  

  // Validar contraseña en tiempo real
  const validatePassword = debounce((value) => {
    if (!value) {
      setPasswordError("El campo de contraseña es obligatorio.");
    } else if (value.length < 4) {
      setPasswordError("La contraseña debe tener al menos 4 caracteres.");
    } else {
      setPasswordError(""); // Limpiar errores si es válida
    }
  }, 300);

  // Función para manejar el envío del formulario
  const handleSignIn = async (e) => {
    e.preventDefault();

    // Limpiar errores anteriores
    setNombreError("");
    setPasswordError("");

    // Realizar la validación antes del envío
    validateNombre(nombre);
    validatePassword(password);

    if (nombreError || passwordError) {
      return; // Evitar envío si hay errores
    }

    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    try {
      const response = await axios.post("http://localhost:3005/api/usuarios/login", {
        nombre,
        password,
      });

      if (response.status === 200) {
        const { token } = response.data;
        localStorage.setItem("token", token);

        const userResponse = await axios.get("http://localhost:3005/api/usuarios", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user = userResponse.data.find(user => user.nombre === nombre);

        if (!user.estado) {
          Swal.fire({
            icon: "error",
            title: "Usuario inactivo",
            text: "El usuario está inactivo. Por favor, comuníquese con el administrador para recuperar el acceso.",
          });
          return;
        }

        const roleResponse = await axios.get(`http://localhost:3005/api/roles/${user.id_rol}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const permisosRol = roleResponse.data.permisosRol;
        login(user, permisosRol.map(permiso => permiso.nombre_permiso));
        updatePermissions(permisosRol.map(permiso => permiso.nombre_permiso));

        Toast.fire({
          icon: "success",
          title: "Acceso concedido."
        });

        navigate("/dashboard/home");
      } else {
        throw new Error("Credenciales inválidas");
      }
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: "Credenciales inválidas. Por favor, inténtelo de nuevo."
      });
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-0 to-white py-12 px-4">
      <div className="flex flex-col lg:flex-row w-full max-w-4xl mx-auto">
        <div className="lg:w-1/2 p-6 bg-white rounded-lg shadow-lg">
          <div className="text-center mb-4 mt-16">
            <Typography variant="h3" className=" text-blue-gray-900 font-semibold mb-6">Iniciar Sesión</Typography>
            <Typography variant="h6" className="text-gray-600 mt-4">
              Ingrese su usuario y contraseña para iniciar sesión.
            </Typography>
          </div>
          <Card className="shadow-none p-4">
            <form className="space-y-4" onSubmit={handleSignIn}>
              <div>
                <Typography variant="small" color="black" className="block font-medium mb-1">
                  Usuario
                </Typography>
                <Input
                  size="md"
                  placeholder=""
                  className={`w-full border-gray-300 rounded-lg focus:border-lime-800 focus:ring-1 transition duration-300 ${nombreError ? 'border-red-500 animate-pulse' : ''}`}
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    validateNombre(e.target.value);
                  }}
                />
                <Typography className={`text-red-500 text-sm transition-opacity duration-300 ease-in-out ${nombreError ? 'opacity-100' : 'opacity-0'}`}>
                  {nombreError}
                </Typography>
              </div>
              <div>
                <Typography variant="small" color="black" className="block font-medium mb-1">
                  Contraseña
                </Typography>
                <Input
                  type="password"
                  size="md"
                  placeholder="********"
                  className={`w-full border-gray-300 rounded-lg focus:border-lime-800 focus:ring-1 transition duration-300 ${passwordError ? 'border-red-500 animate-pulse' : ''}`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validatePassword(e.target.value);
                  }}
                />
                <Typography className={`text-red-500 text-sm transition-opacity duration-300 ease-in-out ${passwordError ? 'opacity-100' : 'opacity-0'}`}>
                  {passwordError}
                </Typography>
              </div>
              <Button type="submit" className="w-full bg-black hover:bg-green-700 text-white py-2 px-4 rounded-lg transition duration-300 transform hover:scale-105">
                Iniciar Sesión
              </Button>
            </form>
          
          </Card>
        </div>
        <div className="lg:w-2/4 hidden lg:block bg-gradient-to-br from-green-100 to-green-300 rounded-lg overflow-hidden">
          <img
            src="/img/eapsasi2.png"
            className="h-full w-full object-cover rounded-lg"
            alt="Background"
          />
        </div>
      </div>
    </section>
  );
}

export default SignIn;
