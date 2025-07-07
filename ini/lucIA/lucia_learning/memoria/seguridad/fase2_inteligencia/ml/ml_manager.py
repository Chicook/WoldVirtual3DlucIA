#!/usr/bin/env python3
"""
ml_manager.py
Gestor de Machine Learning para lucIA
Implementa modelos de detección de anomalías, clasificación de amenazas y predicción de ataques
"""

import os
import sys
import json
import time
import pickle
import logging
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple, Union
from dataclasses import dataclass, asdict
from collections import defaultdict
import threading
import queue
import sqlite3
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# Machine Learning imports
try:
    import sklearn
    from sklearn.ensemble import RandomForestClassifier, IsolationForest
    from sklearn.cluster import DBSCAN, KMeans
    from sklearn.preprocessing import StandardScaler, LabelEncoder
    from sklearn.model_selection import train_test_split, cross_val_score
    from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.decomposition import PCA
    from sklearn.svm import OneClassSVM
    from sklearn.neighbors import LocalOutlierFactor
    from sklearn.linear_model import LogisticRegression
    from sklearn.naive_bayes import GaussianNB
    from sklearn.tree import DecisionTreeClassifier
    from sklearn.neural_network import MLPClassifier
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    print("scikit-learn no disponible. Instalar con: pip install scikit-learn")

# Deep Learning imports
try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras import layers, models
    from tensorflow.keras.preprocessing.sequence import pad_sequences
    DL_AVAILABLE = True
except ImportError:
    DL_AVAILABLE = False
    print("TensorFlow no disponible. Instalar con: pip install tensorflow")

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class MLModel:
    """Modelo de Machine Learning"""
    id: str
    name: str
    type: str  # "anomaly_detection", "classification", "regression", "clustering"
    algorithm: str
    version: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    created_at: datetime
    last_updated: datetime
    status: str  # "training", "ready", "degraded", "retired"
    features: List[str]
    hyperparameters: Dict[str, Any]
    model_path: str
    metadata: Dict[str, Any]

@dataclass
class TrainingData:
    """Datos de entrenamiento"""
    id: str
    name: str
    description: str
    source: str
    size: int
    features: List[str]
    target_column: str
    created_at: datetime
    last_updated: datetime
    data_path: str
    metadata: Dict[str, Any]

@dataclass
class Prediction:
    """Predicción del modelo"""
    model_id: str
    input_data: Dict[str, Any]
    prediction: Any
    confidence: float
    timestamp: datetime
    features_used: List[str]
    metadata: Dict[str, Any]

@dataclass
class AnomalyDetection:
    """Detección de anomalías"""
    entity_id: str
    entity_type: str
    anomaly_score: float
    threshold: float
    is_anomaly: bool
    features: Dict[str, float]
    timestamp: datetime
    model_id: str
    confidence: float

@dataclass
class ThreatClassification:
    """Clasificación de amenazas"""
    threat_id: str
    threat_type: str
    confidence: float
    features: Dict[str, float]
    timestamp: datetime
    model_id: str
    metadata: Dict[str, Any]

class MLManager:
    """Gestor principal de Machine Learning"""
    
    def __init__(self, config_path: Optional[str] = None):
        self.config = self._load_config(config_path)
        self.models: Dict[str, MLModel] = {}
        self.training_data: Dict[str, TrainingData] = {}
        self.predictions: List[Prediction] = []
        self.anomalies: List[AnomalyDetection] = []
        self.threat_classifications: List[ThreatClassification] = []
        
        # Modelos cargados en memoria
        self.loaded_models: Dict[str, Any] = {}
        self.scalers: Dict[str, StandardScaler] = {}
        self.encoders: Dict[str, LabelEncoder] = {}
        
        # Base de datos
        self.db_path = "ml_models.db"
        self._init_database()
        
        # Cola de entrenamiento
        self.training_queue = queue.Queue()
        self.training_thread = None
        self.training_running = False
        
        # Métricas de rendimiento
        self.performance_metrics = defaultdict(list)
        
        logger.info("ML Manager inicializado")
    
    def _load_config(self, config_path: Optional[str]) -> Dict[str, Any]:
        """Cargar configuración de ML"""
        default_config = {
            'models_dir': 'models/',
            'data_dir': 'data/',
            'max_models': 50,
            'auto_retrain_interval': 24,  # horas
            'min_accuracy_threshold': 0.8,
            'anomaly_threshold': 0.7,
            'prediction_confidence_threshold': 0.6,
            'enable_auto_optimization': True,
            'enable_ensemble_learning': True,
            'enable_feature_selection': True,
            'cross_validation_folds': 5,
            'test_size': 0.2,
            'random_state': 42,
            'max_training_time': 3600,  # segundos
            'enable_model_versioning': True,
            'enable_online_learning': True,
            'batch_size': 32,
            'epochs': 100,
            'learning_rate': 0.001,
            'early_stopping_patience': 10,
            'enable_gpu_acceleration': True,
            'model_backup_interval': 24,  # horas
            'enable_experiment_tracking': True
        }
        
        if config_path and os.path.exists(config_path):
            try:
                with open(config_path, 'r') as f:
                    user_config = json.load(f)
                    default_config.update(user_config)
            except Exception as e:
                logger.error(f"Error cargando configuración: {e}")
        
        return default_config
    
    def _init_database(self):
        """Inicializar base de datos para ML"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Tabla de modelos
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS ml_models (
                    id TEXT PRIMARY KEY,
                    name TEXT,
                    type TEXT,
                    algorithm TEXT,
                    version TEXT,
                    accuracy REAL,
                    precision REAL,
                    recall REAL,
                    f1_score REAL,
                    created_at TEXT,
                    last_updated TEXT,
                    status TEXT,
                    features TEXT,
                    hyperparameters TEXT,
                    model_path TEXT,
                    metadata TEXT
                )
            ''')
            
            # Tabla de datos de entrenamiento
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS training_data (
                    id TEXT PRIMARY KEY,
                    name TEXT,
                    description TEXT,
                    source TEXT,
                    size INTEGER,
                    features TEXT,
                    target_column TEXT,
                    created_at TEXT,
                    last_updated TEXT,
                    data_path TEXT,
                    metadata TEXT
                )
            ''')
            
            # Tabla de predicciones
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS predictions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    model_id TEXT,
                    input_data TEXT,
                    prediction TEXT,
                    confidence REAL,
                    timestamp TEXT,
                    features_used TEXT,
                    metadata TEXT
                )
            ''')
            
            # Tabla de anomalías
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS anomalies (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    entity_id TEXT,
                    entity_type TEXT,
                    anomaly_score REAL,
                    threshold REAL,
                    is_anomaly INTEGER,
                    features TEXT,
                    timestamp TEXT,
                    model_id TEXT,
                    confidence REAL
                )
            ''')
            
            # Tabla de métricas de rendimiento
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS performance_metrics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    model_id TEXT,
                    metric_name TEXT,
                    metric_value REAL,
                    timestamp TEXT
                )
            ''')
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error inicializando base de datos ML: {e}")
    
    def create_anomaly_detection_model(self, name: str, algorithm: str = "isolation_forest") -> str:
        """Crear modelo de detección de anomalías"""
        try:
            model_id = f"anomaly_{name}_{int(time.time())}"
            
            # Configurar algoritmo
            if algorithm == "isolation_forest":
                model = IsolationForest(
                    contamination=0.1,
                    random_state=self.config['random_state'],
                    n_estimators=100
                )
            elif algorithm == "one_class_svm":
                model = OneClassSVM(
                    kernel='rbf',
                    nu=0.1,
                    gamma='scale'
                )
            elif algorithm == "local_outlier_factor":
                model = LocalOutlierFactor(
                    contamination=0.1,
                    n_neighbors=20,
                    algorithm='auto'
                )
            else:
                raise ValueError(f"Algoritmo no soportado: {algorithm}")
            
            # Crear modelo ML
            ml_model = MLModel(
                id=model_id,
                name=name,
                type="anomaly_detection",
                algorithm=algorithm,
                version="1.0.0",
                accuracy=0.0,
                precision=0.0,
                recall=0.0,
                f1_score=0.0,
                created_at=datetime.now(),
                last_updated=datetime.now(),
                status="training",
                features=[],
                hyperparameters=model.get_params(),
                model_path=f"{self.config['models_dir']}/{model_id}.pkl",
                metadata={"algorithm": algorithm}
            )
            
            # Guardar modelo
            self.models[model_id] = ml_model
            self._save_model_to_db(ml_model)
            
            # Guardar modelo en disco
            os.makedirs(os.path.dirname(ml_model.model_path), exist_ok=True)
            with open(ml_model.model_path, 'wb') as f:
                pickle.dump(model, f)
            
            logger.info(f"Modelo de anomalías creado: {model_id}")
            return model_id
            
        except Exception as e:
            logger.error(f"Error creando modelo de anomalías: {e}")
            raise
    
    def create_classification_model(self, name: str, algorithm: str = "random_forest") -> str:
        """Crear modelo de clasificación"""
        try:
            model_id = f"classification_{name}_{int(time.time())}"
            
            # Configurar algoritmo
            if algorithm == "random_forest":
                model = RandomForestClassifier(
                    n_estimators=100,
                    max_depth=10,
                    random_state=self.config['random_state']
                )
            elif algorithm == "logistic_regression":
                model = LogisticRegression(
                    random_state=self.config['random_state'],
                    max_iter=1000
                )
            elif algorithm == "naive_bayes":
                model = GaussianNB()
            elif algorithm == "decision_tree":
                model = DecisionTreeClassifier(
                    max_depth=10,
                    random_state=self.config['random_state']
                )
            elif algorithm == "neural_network":
                if not DL_AVAILABLE:
                    raise ImportError("TensorFlow requerido para redes neuronales")
                model = MLPClassifier(
                    hidden_layer_sizes=(100, 50),
                    max_iter=500,
                    random_state=self.config['random_state']
                )
            else:
                raise ValueError(f"Algoritmo no soportado: {algorithm}")
            
            # Crear modelo ML
            ml_model = MLModel(
                id=model_id,
                name=name,
                type="classification",
                algorithm=algorithm,
                version="1.0.0",
                accuracy=0.0,
                precision=0.0,
                recall=0.0,
                f1_score=0.0,
                created_at=datetime.now(),
                last_updated=datetime.now(),
                status="training",
                features=[],
                hyperparameters=model.get_params(),
                model_path=f"{self.config['models_dir']}/{model_id}.pkl",
                metadata={"algorithm": algorithm}
            )
            
            # Guardar modelo
            self.models[model_id] = ml_model
            self._save_model_to_db(ml_model)
            
            # Guardar modelo en disco
            os.makedirs(os.path.dirname(ml_model.model_path), exist_ok=True)
            with open(ml_model.model_path, 'wb') as f:
                pickle.dump(model, f)
            
            logger.info(f"Modelo de clasificación creado: {model_id}")
            return model_id
            
        except Exception as e:
            logger.error(f"Error creando modelo de clasificación: {e}")
            raise
    
    def create_clustering_model(self, name: str, algorithm: str = "kmeans") -> str:
        """Crear modelo de clustering"""
        try:
            model_id = f"clustering_{name}_{int(time.time())}"
            
            # Configurar algoritmo
            if algorithm == "kmeans":
                model = KMeans(
                    n_clusters=5,
                    random_state=self.config['random_state']
                )
            elif algorithm == "dbscan":
                model = DBSCAN(
                    eps=0.5,
                    min_samples=5
                )
            else:
                raise ValueError(f"Algoritmo no soportado: {algorithm}")
            
            # Crear modelo ML
            ml_model = MLModel(
                id=model_id,
                name=name,
                type="clustering",
                algorithm=algorithm,
                version="1.0.0",
                accuracy=0.0,
                precision=0.0,
                recall=0.0,
                f1_score=0.0,
                created_at=datetime.now(),
                last_updated=datetime.now(),
                status="training",
                features=[],
                hyperparameters=model.get_params(),
                model_path=f"{self.config['models_dir']}/{model_id}.pkl",
                metadata={"algorithm": algorithm}
            )
            
            # Guardar modelo
            self.models[model_id] = ml_model
            self._save_model_to_db(ml_model)
            
            # Guardar modelo en disco
            os.makedirs(os.path.dirname(ml_model.model_path), exist_ok=True)
            with open(ml_model.model_path, 'wb') as f:
                pickle.dump(model, f)
            
            logger.info(f"Modelo de clustering creado: {model_id}")
            return model_id
            
        except Exception as e:
            logger.error(f"Error creando modelo de clustering: {e}")
            raise
    
    def train_model(self, model_id: str, data_path: str, target_column: str = None) -> bool:
        """Entrenar modelo con datos"""
        try:
            if model_id not in self.models:
                raise ValueError(f"Modelo no encontrado: {model_id}")
            
            model_info = self.models[model_id]
            
            # Cargar datos
            if data_path.endswith('.csv'):
                data = pd.read_csv(data_path)
            elif data_path.endswith('.json'):
                data = pd.read_json(data_path)
            else:
                raise ValueError(f"Formato de datos no soportado: {data_path}")
            
            # Preparar datos
            if model_info.type == "anomaly_detection":
                return self._train_anomaly_model(model_id, data)
            elif model_info.type == "classification":
                return self._train_classification_model(model_id, data, target_column)
            elif model_info.type == "clustering":
                return self._train_clustering_model(model_id, data)
            else:
                raise ValueError(f"Tipo de modelo no soportado: {model_info.type}")
                
        except Exception as e:
            logger.error(f"Error entrenando modelo {model_id}: {e}")
            return False
    
    def _train_anomaly_model(self, model_id: str, data: pd.DataFrame) -> bool:
        """Entrenar modelo de anomalías"""
        try:
            model_info = self.models[model_id]
            
            # Cargar modelo
            with open(model_info.model_path, 'rb') as f:
                model = pickle.load(f)
            
            # Preparar datos
            features = self._select_features(data)
            X = data[features].fillna(0)
            
            # Escalar datos
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)
            
            # Entrenar modelo
            if model_info.algorithm == "isolation_forest":
                model.fit(X_scaled)
                # Para Isolation Forest, valores negativos indican anomalías
                scores = model.score_samples(X_scaled)
                predictions = model.predict(X_scaled)
            elif model_info.algorithm == "one_class_svm":
                model.fit(X_scaled)
                scores = model.score_samples(X_scaled)
                predictions = model.predict(X_scaled)
            elif model_info.algorithm == "local_outlier_factor":
                predictions = model.fit_predict(X_scaled)
                scores = model.negative_outlier_factor_
            
            # Actualizar modelo
            model_info.features = features
            model_info.status = "ready"
            model_info.last_updated = datetime.now()
            
            # Guardar escalador
            self.scalers[model_id] = scaler
            
            # Guardar modelo actualizado
            with open(model_info.model_path, 'wb') as f:
                pickle.dump(model, f)
            
            self._update_model_in_db(model_info)
            
            logger.info(f"Modelo de anomalías entrenado: {model_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error entrenando modelo de anomalías: {e}")
            return False
    
    def _train_classification_model(self, model_id: str, data: pd.DataFrame, target_column: str) -> bool:
        """Entrenar modelo de clasificación"""
        try:
            model_info = self.models[model_id]
            
            # Cargar modelo
            with open(model_info.model_path, 'rb') as f:
                model = pickle.load(f)
            
            # Preparar datos
            features = self._select_features(data, exclude=[target_column])
            X = data[features].fillna(0)
            y = data[target_column]
            
            # Codificar variables categóricas
            X_encoded, encoders = self._encode_categorical_features(X)
            self.encoders[model_id] = encoders
            
            # Escalar datos
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X_encoded)
            self.scalers[model_id] = scaler
            
            # Dividir datos
            X_train, X_test, y_train, y_test = train_test_split(
                X_scaled, y, test_size=self.config['test_size'],
                random_state=self.config['random_state']
            )
            
            # Entrenar modelo
            model.fit(X_train, y_train)
            
            # Evaluar modelo
            y_pred = model.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            
            # Calcular métricas
            from sklearn.metrics import precision_recall_fscore_support
            precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='weighted')
            
            # Actualizar modelo
            model_info.features = features
            model_info.accuracy = accuracy
            model_info.precision = precision
            model_info.recall = recall
            model_info.f1_score = f1
            model_info.status = "ready"
            model_info.last_updated = datetime.now()
            
            # Guardar modelo actualizado
            with open(model_info.model_path, 'wb') as f:
                pickle.dump(model, f)
            
            self._update_model_in_db(model_info)
            
            # Guardar métricas
            self._save_performance_metrics(model_id, {
                'accuracy': accuracy,
                'precision': precision,
                'recall': recall,
                'f1_score': f1
            })
            
            logger.info(f"Modelo de clasificación entrenado: {model_id} - Accuracy: {accuracy:.3f}")
            return True
            
        except Exception as e:
            logger.error(f"Error entrenando modelo de clasificación: {e}")
            return False
    
    def _train_clustering_model(self, model_id: str, data: pd.DataFrame) -> bool:
        """Entrenar modelo de clustering"""
        try:
            model_info = self.models[model_id]
            
            # Cargar modelo
            with open(model_info.model_path, 'rb') as f:
                model = pickle.load(f)
            
            # Preparar datos
            features = self._select_features(data)
            X = data[features].fillna(0)
            
            # Escalar datos
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)
            self.scalers[model_id] = scaler
            
            # Entrenar modelo
            if model_info.algorithm == "kmeans":
                model.fit(X_scaled)
                labels = model.labels_
                inertia = model.inertia_
            elif model_info.algorithm == "dbscan":
                labels = model.fit_predict(X_scaled)
                n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
            
            # Actualizar modelo
            model_info.features = features
            model_info.status = "ready"
            model_info.last_updated = datetime.now()
            
            # Guardar modelo actualizado
            with open(model_info.model_path, 'wb') as f:
                pickle.dump(model, f)
            
            self._update_model_in_db(model_info)
            
            logger.info(f"Modelo de clustering entrenado: {model_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error entrenando modelo de clustering: {e}")
            return False
    
    def _select_features(self, data: pd.DataFrame, exclude: List[str] = None) -> List[str]:
        """Seleccionar características para el modelo"""
        exclude = exclude or []
        
        # Obtener columnas numéricas
        numeric_features = data.select_dtypes(include=[np.number]).columns.tolist()
        
        # Filtrar columnas excluidas
        features = [col for col in numeric_features if col not in exclude]
        
        # Limitar número de características si es necesario
        if len(features) > 50:
            # Usar correlación para seleccionar características más importantes
            correlation_matrix = data[features].corr().abs()
            upper_tri = correlation_matrix.where(
                np.triu(np.ones(correlation_matrix.shape), k=1).astype(bool)
            )
            to_drop = [column for column in upper_tri.columns if any(upper_tri[column] > 0.95)]
            features = [col for col in features if col not in to_drop]
        
        return features[:50]  # Limitar a 50 características
    
    def _encode_categorical_features(self, data: pd.DataFrame) -> Tuple[np.ndarray, Dict[str, LabelEncoder]]:
        """Codificar características categóricas"""
        encoders = {}
        encoded_data = data.copy()
        
        for column in data.columns:
            if data[column].dtype == 'object':
                encoder = LabelEncoder()
                encoded_data[column] = encoder.fit_transform(data[column].fillna('Unknown'))
                encoders[column] = encoder
        
        return encoded_data.values, encoders
    
    def predict_anomaly(self, model_id: str, data: Dict[str, Any]) -> Optional[AnomalyDetection]:
        """Predecir anomalía"""
        try:
            if model_id not in self.models:
                raise ValueError(f"Modelo no encontrado: {model_id}")
            
            model_info = self.models[model_id]
            
            if model_info.type != "anomaly_detection":
                raise ValueError(f"Modelo no es de detección de anomalías: {model_info.type}")
            
            # Cargar modelo si no está en memoria
            if model_id not in self.loaded_models:
                with open(model_info.model_path, 'rb') as f:
                    self.loaded_models[model_id] = pickle.load(f)
            
            model = self.loaded_models[model_id]
            scaler = self.scalers.get(model_id)
            
            # Preparar datos
            features = model_info.features
            input_vector = []
            
            for feature in features:
                value = data.get(feature, 0)
                input_vector.append(float(value))
            
            X = np.array([input_vector])
            
            # Escalar datos
            if scaler:
                X_scaled = scaler.transform(X)
            else:
                X_scaled = X
            
            # Predecir
            if model_info.algorithm == "isolation_forest":
                score = model.score_samples(X_scaled)[0]
                prediction = model.predict(X_scaled)[0]
                # Normalizar score
                anomaly_score = 1.0 - (score + 0.5)  # Convertir a 0-1
            elif model_info.algorithm == "one_class_svm":
                score = model.score_samples(X_scaled)[0]
                prediction = model.predict(X_scaled)[0]
                # Normalizar score
                anomaly_score = 1.0 - (score + 0.5)
            elif model_info.algorithm == "local_outlier_factor":
                prediction = model.predict(X_scaled)[0]
                score = model.negative_outlier_factor_[0]
                anomaly_score = 1.0 - (score + 1.0)
            
            # Determinar si es anomalía
            threshold = self.config['anomaly_threshold']
            is_anomaly = anomaly_score > threshold
            
            # Crear detección de anomalía
            anomaly = AnomalyDetection(
                entity_id=data.get('entity_id', 'unknown'),
                entity_type=data.get('entity_type', 'unknown'),
                anomaly_score=anomaly_score,
                threshold=threshold,
                is_anomaly=is_anomaly,
                features=dict(zip(features, input_vector)),
                timestamp=datetime.now(),
                model_id=model_id,
                confidence=anomaly_score
            )
            
            # Guardar detección
            self.anomalies.append(anomaly)
            self._save_anomaly_to_db(anomaly)
            
            return anomaly
            
        except Exception as e:
            logger.error(f"Error prediciendo anomalía: {e}")
            return None
    
    def predict_classification(self, model_id: str, data: Dict[str, Any]) -> Optional[ThreatClassification]:
        """Predecir clasificación"""
        try:
            if model_id not in self.models:
                raise ValueError(f"Modelo no encontrado: {model_id}")
            
            model_info = self.models[model_id]
            
            if model_info.type != "classification":
                raise ValueError(f"Modelo no es de clasificación: {model_info.type}")
            
            # Cargar modelo si no está en memoria
            if model_id not in self.loaded_models:
                with open(model_info.model_path, 'rb') as f:
                    self.loaded_models[model_id] = pickle.load(f)
            
            model = self.loaded_models[model_id]
            scaler = self.scalers.get(model_id)
            encoders = self.encoders.get(model_id, {})
            
            # Preparar datos
            features = model_info.features
            input_vector = []
            
            for feature in features:
                value = data.get(feature, 0)
                
                # Codificar si es necesario
                if feature in encoders:
                    try:
                        value = encoders[feature].transform([str(value)])[0]
                    except:
                        value = 0
                
                input_vector.append(float(value))
            
            X = np.array([input_vector])
            
            # Escalar datos
            if scaler:
                X_scaled = scaler.transform(X)
            else:
                X_scaled = X
            
            # Predecir
            prediction = model.predict(X_scaled)[0]
            probabilities = model.predict_proba(X_scaled)[0]
            confidence = max(probabilities)
            
            # Crear clasificación de amenaza
            threat_classification = ThreatClassification(
                threat_id=data.get('threat_id', 'unknown'),
                threat_type=str(prediction),
                confidence=confidence,
                features=dict(zip(features, input_vector)),
                timestamp=datetime.now(),
                model_id=model_id,
                metadata={"probabilities": probabilities.tolist()}
            )
            
            # Guardar clasificación
            self.threat_classifications.append(threat_classification)
            self._save_threat_classification_to_db(threat_classification)
            
            return threat_classification
            
        except Exception as e:
            logger.error(f"Error prediciendo clasificación: {e}")
            return None
    
    def get_model_performance(self, model_id: str) -> Dict[str, Any]:
        """Obtener rendimiento del modelo"""
        try:
            if model_id not in self.models:
                raise ValueError(f"Modelo no encontrado: {model_id}")
            
            model_info = self.models[model_id]
            
            # Obtener métricas históricas
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                SELECT metric_name, metric_value, timestamp 
                FROM performance_metrics 
                WHERE model_id = ? 
                ORDER BY timestamp DESC
            ''', (model_id,))
            
            metrics_history = cursor.fetchall()
            conn.close()
            
            return {
                'model_info': asdict(model_info),
                'current_metrics': {
                    'accuracy': model_info.accuracy,
                    'precision': model_info.precision,
                    'recall': model_info.recall,
                    'f1_score': model_info.f1_score
                },
                'metrics_history': metrics_history,
                'total_predictions': len([p for p in self.predictions if p.model_id == model_id]),
                'total_anomalies': len([a for a in self.anomalies if a.model_id == model_id])
            }
            
        except Exception as e:
            logger.error(f"Error obteniendo rendimiento del modelo: {e}")
            return {}
    
    def _save_model_to_db(self, model: MLModel):
        """Guardar modelo en base de datos"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO ml_models 
                (id, name, type, algorithm, version, accuracy, precision, recall, f1_score,
                 created_at, last_updated, status, features, hyperparameters, model_path, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (model.id, model.name, model.type, model.algorithm, model.version,
                  model.accuracy, model.precision, model.recall, model.f1_score,
                  model.created_at.isoformat(), model.last_updated.isoformat(),
                  model.status, json.dumps(model.features), json.dumps(model.hyperparameters),
                  model.model_path, json.dumps(model.metadata)))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Error guardando modelo en DB: {e}")
    
    def _update_model_in_db(self, model: MLModel):
        """Actualizar modelo en base de datos"""
        self._save_model_to_db(model)
    
    def _save_anomaly_to_db(self, anomaly: AnomalyDetection):
        """Guardar anomalía en base de datos"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO anomalies 
                (entity_id, entity_type, anomaly_score, threshold, is_anomaly,
                 features, timestamp, model_id, confidence)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (anomaly.entity_id, anomaly.entity_type, anomaly.anomaly_score,
                  anomaly.threshold, anomaly.is_anomaly, json.dumps(anomaly.features),
                  anomaly.timestamp.isoformat(), anomaly.model_id, anomaly.confidence))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Error guardando anomalía en DB: {e}")
    
    def _save_threat_classification_to_db(self, classification: ThreatClassification):
        """Guardar clasificación de amenaza en base de datos"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO predictions 
                (model_id, input_data, prediction, confidence, timestamp, features_used, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (classification.model_id, json.dumps(classification.features),
                  classification.threat_type, classification.confidence,
                  classification.timestamp.isoformat(), json.dumps(list(classification.features.keys())),
                  json.dumps(classification.metadata)))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Error guardando clasificación en DB: {e}")
    
    def _save_performance_metrics(self, model_id: str, metrics: Dict[str, float]):
        """Guardar métricas de rendimiento"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            for metric_name, metric_value in metrics.items():
                cursor.execute('''
                    INSERT INTO performance_metrics (model_id, metric_name, metric_value, timestamp)
                    VALUES (?, ?, ?, ?)
                ''', (model_id, metric_name, metric_value, datetime.now().isoformat()))
            
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Error guardando métricas: {e}")
    
    def get_statistics(self) -> Dict[str, Any]:
        """Obtener estadísticas de ML"""
        return {
            'total_models': len(self.models),
            'models_by_type': {
                'anomaly_detection': len([m for m in self.models.values() if m.type == 'anomaly_detection']),
                'classification': len([m for m in self.models.values() if m.type == 'classification']),
                'clustering': len([m for m in self.models.values() if m.type == 'clustering'])
            },
            'models_by_status': {
                'ready': len([m for m in self.models.values() if m.status == 'ready']),
                'training': len([m for m in self.models.values() if m.status == 'training']),
                'degraded': len([m for m in self.models.values() if m.status == 'degraded'])
            },
            'total_predictions': len(self.predictions),
            'total_anomalies': len(self.anomalies),
            'total_classifications': len(self.threat_classifications),
            'average_accuracy': sum(m.accuracy for m in self.models.values() if m.status == 'ready') / 
                              max(len([m for m in self.models.values() if m.status == 'ready']), 1)
        }

# Función principal para integración con lucIA
def run_ml_analysis(data: Dict[str, Any] = None, analysis_type: str = "anomaly") -> str:
    """Función principal para integración con lucIA"""
    try:
        ml_manager = MLManager()
        
        if not data:
            stats = ml_manager.get_statistics()
            return f"ML Manager activo. Modelos: {stats['total_models']}, Predicciones: {stats['total_predictions']}"
        
        # Crear modelo si no existe
        model_name = f"lucia_{analysis_type}"
        model_id = None
        
        for model in ml_manager.models.values():
            if model.name == model_name and model.type == analysis_type:
                model_id = model.id
                break
        
        if not model_id:
            if analysis_type == "anomaly":
                model_id = ml_manager.create_anomaly_detection_model(model_name)
            elif analysis_type == "classification":
                model_id = ml_manager.create_classification_model(model_name)
            else:
                return f"Tipo de análisis no soportado: {analysis_type}"
        
        # Realizar predicción
        if analysis_type == "anomaly":
            result = ml_manager.predict_anomaly(model_id, data)
            if result:
                return f"Anomalía detectada: {result.is_anomaly}, Score: {result.anomaly_score:.3f}"
            else:
                return "No se pudo realizar la predicción de anomalía"
        
        elif analysis_type == "classification":
            result = ml_manager.predict_classification(model_id, data)
            if result:
                return f"Amenaza clasificada: {result.threat_type}, Confianza: {result.confidence:.3f}"
            else:
                return "No se pudo realizar la clasificación"
        
        return "Análisis completado"
    
    except Exception as e:
        return f"Error en análisis ML: {e}"

if __name__ == "__main__":
    # Ejemplo de uso
    test_data = {
        'entity_id': 'test_user',
        'entity_type': 'user',
        'login_attempts': 5,
        'failed_logins': 2,
        'bytes_transferred': 1024,
        'connections': 3
    }
    
    result = run_ml_analysis(test_data, "anomaly")
    print(result) 