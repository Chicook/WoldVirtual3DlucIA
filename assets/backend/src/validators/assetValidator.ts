/**
 * @fileoverview Validación avanzada para assets
 * @module backend/src/validators/assetValidator
 */

import { AssetType, AssetStatus } from '../entities/Asset';
import { Request, Response, NextFunction } from 'express';

// Validar campos obligatorios y tipos
export function validateAssetCreate(req: Request, res: Response, next: NextFunction) {
  const {
    name,
    type,
    fileUrl,
    ownerId
  } = req.body;

  if (!name || typeof name !== 'string' || name.length < 3) {
    return res.status(400).json({ error: 'El nombre es obligatorio y debe tener al menos 3 caracteres.' });
  }
  if (!type || !Object.values(AssetType).includes(type)) {
    return res.status(400).json({ error: 'Tipo de asset inválido.' });
  }
  if (!fileUrl || typeof fileUrl !== 'string' || !fileUrl.startsWith('http')) {
    return res.status(400).json({ error: 'URL de archivo inválida.' });
  }
  if (!ownerId || typeof ownerId !== 'string') {
    return res.status(400).json({ error: 'El ownerId es obligatorio.' });
  }
  next();
}

export function validateAssetUpdate(req: Request, res: Response, next: NextFunction) {
  const {
    name,
    type,
    status,
    fileUrl
  } = req.body;

  if (name && (typeof name !== 'string' || name.length < 3)) {
    return res.status(400).json({ error: 'El nombre debe tener al menos 3 caracteres.' });
  }
  if (type && !Object.values(AssetType).includes(type)) {
    return res.status(400).json({ error: 'Tipo de asset inválido.' });
  }
  if (status && !Object.values(AssetStatus).includes(status)) {
    return res.status(400).json({ error: 'Estado de asset inválido.' });
  }
  if (fileUrl && (typeof fileUrl !== 'string' || !fileUrl.startsWith('http'))) {
    return res.status(400).json({ error: 'URL de archivo inválida.' });
  }
  next();
} 