// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

generator client {
provider = "prisma-client-js"
output = "../src/generated/prisma"
}

datasource db {
provider = "postgresql"
url = env("DATABASE_URL")
}

enum Role {
USER
ADMIN
MODERATOR
}

enum AuthProvider {
GOOGLE
ANON
}

enum ReportStatus {
PENDING // Denuncia enviada, en espera de moderación
APPROVED // Denuncia publicada
REJECTED // Rechazada por ser falsa/spam
}

enum MediaType {
IMAGE
VIDEO
AUDIO
DOCUMENT
}

enum Department {
LA_PAZ
COCHABAMBA
SANTA_CRUZ
ORURO
POTOSI
CHUQUISACA
TARIJA
BENI
PANDO
}

enum MisconductType {
EXTORSION
SOBORNO
ABUSO_DE_AUTORIDAD
COHECHO
AMENAZA
OTRO
}

// Modelos
model User {
id String @id @default(cuid())
email String? @unique
name String?
pictureUrl String?
provider AuthProvider @default(ANON)
providerId String? // ID externo (p. ej. sub de Google)
lastLoginAt DateTime?
role Role @default(USER)
isActive Boolean @default(true)
bannedAt DateTime?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

reports Report[]
moderatedReports Report[] @relation("ReportModeratedBy")
ReportStatusHistory ReportStatusHistory[]

@@unique([provider, providerId])
@@index([role])
}

model Report {
id String @id @default(cuid())
description String
misconductType MisconductType @default(OTRO)

department Department
city String
policeName String?
policeUnit String?
latitude Float?
longitude Float?

isAnonymous Boolean @default(true)
status ReportStatus @default(PENDING)
statusReason String? // Motivo de aprobación/rechazo
tags String[] // para filtros (ej. “coima”, “retén”)
reportedAt DateTime @default(now()) // fecha del hecho
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

// Relaciones
userId String?
user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

moderatedById String?
moderatedBy User? @relation("ReportModeratedBy", fields: [moderatedById], references: [id], onDelete: SetNull)

evidences Evidence[]
statusHistory ReportStatusHistory[]

@@index([status, createdAt(sort: Desc)])
@@index([department, city])
@@index([userId, createdAt(sort: Desc)])
@@index([latitude, longitude])
}

model Evidence {
id String @id @default(cuid())
url String // Ruta en S3/Supabase
type MediaType
contentType String?
fileSize Int?
checksum String? // sha256/md5 para deduplicar/verificar
width Int?
height Int?
durationSec Int?
createdAt DateTime @default(now())

// Relaciones
reportId String
report Report @relation(fields: [reportId], references: [id], onDelete: Cascade)

@@index([reportId])
}

model ReportStatusHistory {
id String @id @default(cuid())
reportId String
report Report @relation(fields: [reportId], references: [id], onDelete: Cascade)
fromStatus ReportStatus?
toStatus ReportStatus
reason String?
moderatorId String?
moderator User? @relation(fields: [moderatorId], references: [id], onDelete: SetNull)
createdAt DateTime @default(now())

@@index([reportId, createdAt(sort: Desc)])
}

// Documentos de transparencia
model Document {
id String @id @default(cuid())
title String
slug String @unique
description String?
fileUrl String?
fileType String?
fileSize Int?
isPublic Boolean @default(true)
sourceUrl String?
year Int?
keywords String[]
publishedAt DateTime @default(now())
updatedAt DateTime @updatedAt
createdAt DateTime @default(now())

// Relaciones
categoryId String?
category Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)

@@index([isPublic, publishedAt(sort: Desc)])
@@map("documents")
}

// Modelo para categorías de documentos
model Category {
id String @id @default(cuid())
name String @unique
slug String @unique
description String?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

documents Document[]

@@map("categories")
}
