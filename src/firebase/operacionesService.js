import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

const OPERACIONES_COLLECTION = 'operaciones';

// Obtener todas las operaciones
export const getOperaciones = async () => {
  try {
    const operacionesRef = collection(db, OPERACIONES_COLLECTION);
    const snapshot = await getDocs(operacionesRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error al obtener operaciones:", error);
    throw error;
  }
};

// Obtener una operación por ID
export const getOperacionById = async (id) => {
  try {
    const operacionRef = doc(db, OPERACIONES_COLLECTION, id);
    const operacionDoc = await getDoc(operacionRef);
    
    if (operacionDoc.exists()) {
      return {
        id: operacionDoc.id,
        ...operacionDoc.data()
      };
    } else {
      throw new Error("La operación no existe");
    }
  } catch (error) {
    console.error("Error al obtener la operación:", error);
    throw error;
  }
};

// Crear una nueva operación
export const createOperacion = async (operacionData) => {
  try {
    const operacionesRef = collection(db, OPERACIONES_COLLECTION);
    const newOperacion = {
      ...operacionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(operacionesRef, newOperacion);
    return {
      id: docRef.id,
      ...newOperacion
    };
  } catch (error) {
    console.error("Error al crear la operación:", error);
    throw error;
  }
};

// Actualizar una operación existente
export const updateOperacion = async (id, operacionData) => {
  try {
    const operacionRef = doc(db, OPERACIONES_COLLECTION, id);
    const updatedData = {
      ...operacionData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(operacionRef, updatedData);
    return {
      id,
      ...updatedData
    };
  } catch (error) {
    console.error("Error al actualizar la operación:", error);
    throw error;
  }
};

// Eliminar una operación
export const deleteOperacion = async (id) => {
  try {
    const operacionRef = doc(db, OPERACIONES_COLLECTION, id);
    await deleteDoc(operacionRef);
    return id;
  } catch (error) {
    console.error("Error al eliminar la operación:", error);
    throw error;
  }
};

// Filtrar operaciones por estado
export const getOperacionesByEstado = async (estado) => {
  try {
    const operacionesRef = collection(db, OPERACIONES_COLLECTION);
    const q = query(operacionesRef, where("estado", "==", estado));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error al filtrar operaciones por estado:", error);
    throw error;
  }
};

// Buscar operaciones por término
export const searchOperaciones = async (searchTerm) => {
  try {
    // Nota: Firestore no soporta búsquedas de texto completo nativas
    // Esta es una implementación básica que busca coincidencias exactas
    // Para búsquedas más avanzadas, considerar Algolia o ElasticSearch
    const operacionesRef = collection(db, OPERACIONES_COLLECTION);
    const snapshot = await getDocs(operacionesRef);
    
    const searchTermLower = searchTerm.toLowerCase();
    
    return snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(op => 
        op.id.toLowerCase().includes(searchTermLower) ||
        op.cliente.toLowerCase().includes(searchTermLower) ||
        op.ubicacion.toLowerCase().includes(searchTermLower) ||
        op.piloto.toLowerCase().includes(searchTermLower) ||
        (op.ayudante && op.ayudante.toLowerCase().includes(searchTermLower)) ||
        op.drone.toLowerCase().includes(searchTermLower)
      );
  } catch (error) {
    console.error("Error al buscar operaciones:", error);
    throw error;
  }
};

// Ordenar operaciones
export const getOperacionesOrdenadas = async (campo, ascendente = true) => {
  try {
    const operacionesRef = collection(db, OPERACIONES_COLLECTION);
    const q = query(operacionesRef, orderBy(campo, ascendente ? 'asc' : 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error al ordenar operaciones:", error);
    throw error;
  }
};
