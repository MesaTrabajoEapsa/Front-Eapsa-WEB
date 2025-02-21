import React, { useState, useEffect, useRef } from "react";
import { debounce } from 'lodash';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
  Select,
  Option,
} from "@material-tailwind/react";
import Swal from "sweetalert2";
import axios from "../../utils/axiosConfig";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

const CrearUsuario = ({
  open,
  handleOpen,
  fetchUsuarios,
  selectedUser,
  setSelectedUser,
  editMode,
  roles,
}) => {
  const [formErrors, setFormErrors] = useState({});
  const [duplicateErrors, setDuplicateErrors] = useState({}); // Estado para errores de duplicación

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setFormErrors({});
    setSelectedUser({
      nombre: '',
      email: '',
      password: '',
      tipo_documento: '',
      numero_documento: '',
      genero: '',
      nacionalidad: '',
      telefono: '',
      direccion: '',
      id_rol: ''
    });
  };

  const validateFields = async (user) => {
    const errors = {};
  
    // Validación del nombre
    if (!user.nombre) {
      errors.nombre = 'El nombre es obligatorio.';
    } else if (user.nombre.length < 5) {
      errors.nombre = 'El nombre debe contener al menos 5 letras.';
    } else if (user.nombre.length > 30) {
      errors.nombre = 'El nombre no debe exceder los 30 caracteres.';
    } else if (/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/.test(user.nombre)) {
      errors.nombre = 'El nombre no debe incluir caracteres especiales ni números.';
    } 
  

  
    // Validación de la contraseña
    if (!editMode) {
      if (!user.password) {
        errors.password = 'La contraseña es obligatoria.';
      } else if (user.password.length < 8) {
        errors.password = 'La contraseña debe tener al menos 8 caracteres.';
      } else if (user.password.length > 20) {
        errors.password = 'La contraseña no debe exceder los 20 caracteres.';
      } else if (!/[A-Za-z]/.test(user.password)) {
        errors.password = 'La contraseña debe contener al menos una letra (a-z, A-Z).';
      } else if (!/[0-9]/.test(user.password)) {
        errors.password = 'La contraseña debe contener al menos un número (0-9).';
      } else if (!/[!@#$%^&*()_+={}\[\]:;'"<>,.?/\\|-]/.test(user.password)) {
        errors.password = 'La contraseña debe contener al menos un carácter especial: !@#$%^&*()_+={}[]:;\'"<>,.?/\\|-';
      }
    }

  
    if (!user.id_rol) {
      errors.id_rol = 'Debe seleccionar un rol.';
    } else {
      delete errors.id_rol;
    }
  
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const latestValueRef = useRef({}); // Referencia para almacenar el valor más reciente

  const handleChange = async (e) => {
      const { name, value } = e.target;
      const updatedUser = { ...selectedUser, [name]: value };
      setSelectedUser(updatedUser);
  
      // Almacenar el último valor en la referencia
      latestValueRef.current[name] = value;
  
      // Ejecutar la validación después de un breve período
      await debounceValidate(updatedUser);
  
      // Validación en tiempo real para duplicados
      if (["nombre"].includes(name)) {
          if (value.length > 0) {
              // Guardar el valor localmente para compararlo después
              const currentValue = latestValueRef.current[name];
              const existingUser = await checkUserExists(name, value);
  
              // Verificar si el valor actual sigue siendo el mismo antes de actualizar errores
              if (currentValue === value) {
                  if (existingUser) {
                      setFormErrors((prevErrors) => ({
                          ...prevErrors,
                          [name]: `${name.charAt(0).toUpperCase() + name.slice(1)} ya existe.`,
                      }));
                  } else {
                      setFormErrors((prevErrors) => ({
                          ...prevErrors,
                          [name]: "",
                      }));
                  }
              }
          } else {
              // Si el campo está vacío, limpia el error
              setFormErrors((prevErrors) => ({
                  ...prevErrors,
                  [name]: "",
              }));
          }
      }
  };
  
// Función debounce para la validación
const debounceValidate = debounce(async (user) => {
    await validateFields(user);
}, 400); // 300 ms de espera


  // Función para verificar si el usuario existe en la tabla principal
  const checkUserExists = async (field, value) => {
    try {
        const response = await axios.get(`http://localhost:3005/api/usuarios`); // Consulta toda la tabla
        const userExists = response.data.some(user => user[field] === value); // Verifica si el valor ya existe
        return userExists;
    } catch (error) {
        console.error("Error al verificar la existencia del usuario:", error);
        return false;
    }
  };

  const handleSelectChange = async (name, value) => {
    const updatedUser = { ...selectedUser, [name]: value };
    setSelectedUser(updatedUser);
    await validateFields(updatedUser);  // Validar en tiempo real
  };
  
  const handleSave = async () => {
    const isValid = await validateFields(selectedUser);
    if (!isValid) {
      Toast.fire({
        icon: "error",
        title: "Por favor, completa todos los campos correctamente.",
      });
      return;
    }
  
    try {
      if (editMode) {
        await axios.put(
          `http://:3005/api/usuarios/${selectedUser.id_usuario}`,
          selectedUser
        );
        fetchUsuarios();
        Toast.fire({
          icon: "success",
          title: "El usuario ha sido actualizado correctamente.",
        });
      } else {
        await axios.post("http://:3005/api/usuarios/registro", selectedUser);
        fetchUsuarios();
        Toast.fire({
          icon: "success",
          title: "¡Creación exitosa! El usuario ha sido creado correctamente.",
        });
      }
      handleOpen();
    } catch (error) {
      console.error("Error saving usuario:", error);
      Toast.fire({
        icon: "error",
        title: "Error al guardar usuario. Por favor, inténtalo de nuevo.",
      });
    }
  };

  return (
    <Dialog
      open={open}
      handler={handleOpen}
      className="custom-modal bg-white rounded-3xl shadow-lg max-w-3xl mx-auto"
    >
      <DialogHeader className="bg-white  text-blue-gray-900 border-b border-gray-200 font-semibold p-4 rounded-t-lg">
        {editMode ? "Editar Usuario" : "Crear Usuario"}
      </DialogHeader>
      <DialogBody className="p-4 space-y-1 max-h-80 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-0 gap-6">
          <div className="col-span-1">
            <Input
              label="Nombres y Apellidos"
              name="nombre"
              value={selectedUser.nombre}
              onChange={handleChange}
              required
            />
            {formErrors.nombre && <p className="text-red-500 text-xs mt-1">{formErrors.nombre}</p>}
          </div>
        
        
          {!editMode && (
            <div className="col-span-1">
              <Input
                label="Contraseña"
                name="password"
                type="password"
                value={selectedUser.password}
                onChange={handleChange}
                required
              />
              {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
            </div>
          )}

      

          <div className="col-span-1">
          <Select
              label="Rol"
              name="id_rol"
              value={String(selectedUser.id_rol)}
              onChange={(value) => handleSelectChange("id_rol", value)}
             
            >
              {roles.map((role) => (
                <Option key={role.id_rol} value={String(role.id_rol)}>
                  {role.nombre}
                </Option>
              ))}
            </Select>
            {formErrors.id_rol && <p className="text-red-500 text-xs mt-1">{formErrors.id_rol}</p>}
          </div>
        </div>
      </DialogBody>
      <DialogFooter className="p-4">
        <Button
          className="btncancelarm" size="sm" color="red"
          onClick={handleOpen}
          variant="outlined"
        >
          Cancelar
        </Button>
        <Button
          className="btnagregarm" size="sm"
          onClick={handleSave}
          
        >
          {editMode ? "Actualizar" : "Crear Usuario"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CrearUsuario;
