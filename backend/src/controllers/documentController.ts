import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../config/db';

export async function uploadDocument(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded or file failed validation.' });
    }

    const { documentType, notes } = req.body;

    if (!documentType) {
      // Remove temporary uploaded file if metadata validation fails
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({ error: 'documentType is required.' });
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    const doc = await prisma.document.create({
      data: {
        studentProfileId: profile.id,
        documentType: documentType as any,
        fileName: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        filePath: file.path,
        status: 'UPLOADED',
        notes: notes || null
      }
    });

    return res.status(201).json({
      message: 'Document uploaded successfully.',
      document: {
        id: doc.id,
        documentType: doc.documentType,
        fileName: doc.fileName,
        originalName: doc.originalName,
        mimeType: doc.mimeType,
        fileSize: doc.fileSize,
        status: doc.status,
        notes: doc.notes,
        createdAt: doc.createdAt
      }
    });
  } catch (error) {
    console.error('uploadDocument error:', error);
    return res.status(500).json({ error: 'Failed to upload document.' });
  }
}

export async function getDocuments(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        documents: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    const safeDocuments = profile.documents.map((d) => ({
      id: d.id,
      documentType: d.documentType,
      fileName: d.fileName,
      originalName: d.originalName,
      mimeType: d.mimeType,
      fileSize: d.fileSize,
      status: d.status,
      notes: d.notes,
      createdAt: d.createdAt
    }));

    return res.json({ documents: safeDocuments });
  } catch (error) {
    console.error('getDocuments error:', error);
    return res.status(500).json({ error: 'Failed to retrieve documents.' });
  }
}

export async function downloadDocument(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const doc = await prisma.document.findUnique({
      where: { id },
      include: { studentProfile: true }
    });

    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    // Authorization check: verify owner or counsellor
    if (doc.studentProfile.userId !== userId && req.user!.role !== 'COUNSELLOR') {
      return res.status(403).json({ error: 'Unauthorized to access this private document.' });
    }

    if (!fs.existsSync(doc.filePath)) {
      return res.status(404).json({ error: 'Document file not found on server storage.' });
    }

    res.setHeader('Content-Type', doc.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${doc.originalName}"`);
    return fs.createReadStream(doc.filePath).pipe(res);
  } catch (error) {
    console.error('downloadDocument error:', error);
    return res.status(500).json({ error: 'Failed to stream document file.' });
  }
}

export async function deleteDocument(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const doc = await prisma.document.findUnique({
      where: { id },
      include: { studentProfile: true }
    });

    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    if (doc.studentProfile.userId !== userId && req.user!.role !== 'COUNSELLOR') {
      return res.status(403).json({ error: 'Unauthorized to delete this document.' });
    }

    // Delete file from disk if present
    if (fs.existsSync(doc.filePath)) {
      fs.unlinkSync(doc.filePath);
    }

    await prisma.document.delete({
      where: { id }
    });

    return res.json({ message: 'Document removed successfully.' });
  } catch (error) {
    console.error('deleteDocument error:', error);
    return res.status(500).json({ error: 'Failed to delete document.' });
  }
}
