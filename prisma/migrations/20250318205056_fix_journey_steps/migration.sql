-- CreateTable
CREATE TABLE "JourneySteps" (
    "id" TEXT NOT NULL,
    "businessProposition" TEXT NOT NULL,
    "customerScenario" TEXT NOT NULL,
    "targetCustomers" TEXT NOT NULL,
    "personaName" TEXT NOT NULL,
    "journeyData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "JourneySteps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JourneySteps_projectId_key" ON "JourneySteps"("projectId");

-- AddForeignKey
ALTER TABLE "JourneySteps" ADD CONSTRAINT "JourneySteps_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
