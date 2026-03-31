import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/controlpersonal';

// Definir esquemas
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

const tarjetaSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.model('User', userSchema);
const Tarjeta = mongoose.model('Tarjeta', tarjetaSchema);

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

async function hashPasswords(usuarios) {
  const salt = await bcrypt.genSalt(10);
  
  for (let usuario of usuarios) {
    usuario.password = await bcrypt.hash(usuario.password, salt);
  }
  
  return usuarios;
}

async function resetDatabase() {
  try {
    console.log('========================================');
    console.log('🔄 RESET BASE DE DATOS');
    console.log('========================================');
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');
    
    // Limpiar datos existentes
    console.log('🗑️  Limpiando base de datos...');
    const userDeleteResult = await User.deleteMany({});
    const tarjetaDeleteResult = await Tarjeta.deleteMany({});
    console.log(`   ✅ ${userDeleteResult.deletedCount} usuarios eliminados`);
    console.log(`   ✅ ${tarjetaDeleteResult.deletedCount} tarjetas eliminadas\n`);
    
    // Encriptar contraseñas
    console.log('🔒 Encriptando contraseñas...');
    const usuariosConHash = await hashPasswords(usuariosPrueba);
    console.log('   ✅ Contraseñas encriptadas\n');
    
    // Insertar usuarios
    console.log('📝 Insertando usuarios de prueba...');
    const result = await User.insertMany(usuariosConHash);
    console.log(`   ✅ ${result.length} usuarios creados\n`);
    
    // Mostrar resumen
    console.log('📋 RESUMEN DE USUARIOS CREADOS:');
    console.log('━'.repeat(60));
    console.log('');
    
    // Agrupar por rol
    const jefes = result.filter(u => u.rol === 'jefe');
    const empleados = result.filter(u => u.rol === 'empleado');
    const clientes = result.filter(u => u.rol === 'cliente');
    
    if (jefes.length) {
      console.log('👔 JEFES:');
      jefes.forEach(user => {
        console.log(`   • ${user.nombre} - ${user.email}`);
      });
      console.log('');
    }
    
    if (empleados.length) {
      console.log('👷 EMPLEADOS:');
      empleados.forEach(user => {
        console.log(`   • ${user.nombre} - ${user.email}`);
      });
      console.log('');
    }
    
    if (clientes.length) {
      console.log('👥 CLIENTES:');
      clientes.forEach(user => {
        console.log(`   • ${user.nombre} - ${user.email}`);
      });
      console.log('');
    }
    
    console.log('━'.repeat(60));
    console.log('\n🔑 CREDENCIALES DE ACCESO:');
    console.log('━'.repeat(60));
    console.log('📧 Jefe:         jefe@test.com / 123456');
    console.log('📧 Empleados:    carlos@empresa.com / 123456');
    console.log('                 maria@empresa.com / 123456');
    console.log('                 juan@empresa.com / 123456');
    console.log('                 ana@empresa.com / 123456');
    console.log('📧 Clientes:     cliente@test.com / 123456');
    console.log('                 empresa@test.com / 123456');
    console.log('━'.repeat(60));
    console.log('\n✨ Base de datos inicializada exitosamente');
    console.log('========================================');
    
  } catch (error) {
    console.error('❌ Error al resetear la base de datos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

resetDatabase();