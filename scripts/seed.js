import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Conectar a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/controlpersonal';

// Definir el esquema de usuario (simplificado para el seed)
const userSchema = new mongoose.Schema({
  nombre: String,
  email: String,
  password: String,
  rol: String,
  telefono: String,
  nivel: { type: Number, default: 1 },
  horasTrabajadasHoy: { type: Number, default: 0 },
  tareasActivas: { type: Array, default: [] },
  activo: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Usuarios de prueba
const usuariosPrueba = [
  {
    nombre: "Jefe Principal",
    email: "jefe@test.com",
    password: "123456",
    rol: "jefe",
    telefono: "555-0101",
    nivel: 5
  },
  {
    nombre: "Carlos Rodríguez",
    email: "carlos@empresa.com",
    password: "123456",
    rol: "empleado",
    telefono: "555-0102",
    nivel: 3
  },
  {
    nombre: "María González",
    email: "maria@empresa.com",
    password: "123456",
    rol: "empleado",
    telefono: "555-0103",
    nivel: 4
  },
  {
    nombre: "Juan Pérez",
    email: "juan@empresa.com",
    password: "123456",
    rol: "empleado",
    telefono: "555-0104",
    nivel: 2
  },
  {
    nombre: "Ana Martínez",
    email: "ana@empresa.com",
    password: "123456",
    rol: "empleado",
    telefono: "555-0105",
    nivel: 3
  },
  {
    nombre: "Cliente Premium",
    email: "cliente@test.com",
    password: "123456",
    rol: "cliente",
    telefono: "555-0201",
    nivel: 2
  },
  {
    nombre: "Empresa ABC",
    email: "empresa@test.com",
    password: "123456",
    rol: "cliente",
    telefono: "555-0202",
    nivel: 1
  }
];

// Función para encriptar contraseñas
async function hashPasswords(usuarios) {
  const salt = await bcrypt.genSalt(10);
  
  for (let usuario of usuarios) {
    usuario.password = await bcrypt.hash(usuario.password, salt);
  }
  
  return usuarios;
}

// Función principal
async function seedDatabase() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
    
    // Limpiar usuarios existentes (opcional)
    console.log('🗑️  Limpiando usuarios existentes...');
    await User.deleteMany({});
    console.log('✅ Usuarios eliminados');
    
    // Encriptar contraseñas
    console.log('🔒 Encriptando contraseñas...');
    const usuariosConHash = await hashPasswords(usuariosPrueba);
    
    // Insertar usuarios
    console.log('📝 Insertando usuarios de prueba...');
    const result = await User.insertMany(usuariosConHash);
    console.log(`✅ ${result.length} usuarios creados exitosamente`);
    
    // Mostrar resumen
    console.log('\n📋 Resumen de usuarios creados:');
    console.log('━'.repeat(50));
    result.forEach(user => {
      console.log(`👤 ${user.nombre} (${user.email}) - Rol: ${user.rol}`);
    });
    
    console.log('\n🔑 Credenciales de acceso:');
    console.log('━'.repeat(50));
    console.log('📧 Jefe: jefe@test.com / 123456');
    console.log('📧 Empleados:');
    console.log('   - carlos@empresa.com / 123456');
    console.log('   - maria@empresa.com / 123456');
    console.log('   - juan@empresa.com / 123456');
    console.log('   - ana@empresa.com / 123456');
    console.log('📧 Clientes:');
    console.log('   - cliente@test.com / 123456');
    console.log('   - empresa@test.com / 123456');
    
  } catch (error) {
    console.error('❌ Error al seedear la base de datos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Ejecutar el script
seedDatabase();