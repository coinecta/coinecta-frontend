import { TProject } from '@lib/types/zod-schemas/projectSchema';
import { prisma } from '@server/prisma';
import { mapFullProjectFromDb } from '@server/utils/mapProjectObject';
import { findToCreate, findToDelete, findToUpdate } from '@server/utils/prismaHelpers';
import { z } from 'zod';
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";

export const projectRouter = createTRPCRouter({
  createProject: adminProcedure
    .input(TProject)
    .mutation(async ({ input, ctx }) => {
      if (input.socials && input.tokenomics) {
        try {
          // Create a new project along with its related records
          const newProject = await prisma.project.create({
            data: {
              name: input.name,
              slug: input.slug,
              shortDescription: input.shortDescription,
              whitepaperLink: input.whitepaperLink,
              description: input.description,
              blockchains: input.blockchains,
              fundsRaised: input.fundsRaised,
              bannerImgUrl: input.bannerImgUrl,
              avatarImgUrl: input.avatarImgUrl,
              isLaunched: input.isLaunched,
              isDraft: input.isDraft,
              frontPage: input.frontPage,
              // Create the related records
              socials: { create: input.socials },
              roadmap: { create: input.roadmap },
              team: { create: input.team },
              tokenomics: {
                create: {
                  tokenName: input.tokenomics.tokenName,
                  totalTokens: input.tokenomics.totalTokens,
                  tokenTicker: input.tokenomics.tokenTicker,
                  policyId: input.tokenomics.tokenPolicyId,
                  // For the nested Tokenomic records
                  tokenomics: {
                    create: input.tokenomics.tokenomics,
                  },
                },
              },
              whitelists: { create: input.whitelists },
              fisos: {
                create: input.fisos.map(fiso => ({
                  ...fiso,
                  approvedStakepools: {
                    create: []
                  },
                  spoSignups: {
                    create: []
                  }
                }))
              },
            },
          });

          return newProject;
        } catch (error: any) {
          throw new Error(error)
        }
      }
      else throw new Error('Missing tokenomics or socials fields')
    }),
  editProject: adminProcedure
    .input(TProject)
    .mutation(async ({ input, ctx }) => {
      if (!input.socials || !input.tokenomics) {
        throw new Error('Missing required fields');
      }

      const { slug, socials, roadmap, team, tokenomics, whitelists, fisos, ...rest } = input;
      try {
        // update roadmap items
        const currentRoadmap = await prisma.roadmap.findMany({ where: { project_slug: slug } });
        const toUpdateRoadmap = findToUpdate(currentRoadmap, roadmap);
        const toDeleteRoadmap = findToDelete(currentRoadmap, roadmap);
        const toCreateRoadmap = findToCreate(currentRoadmap, roadmap);

        await Promise.all([
          ...toUpdateRoadmap.map(r => prisma.roadmap.update({
            where: { id: r.id },
            data: { ...r, project_slug: slug }
          })),
          prisma.roadmap.deleteMany({ where: { id: { in: toDeleteRoadmap.map(r => r.id) } } }),
          prisma.roadmap.createMany({ data: toCreateRoadmap.map(r => ({ ...r, project_slug: slug })) })
        ]);

        // update tokenomics
        const currentTokenomics = await prisma.tokenomics.findUnique({
          where: { project_slug: slug },
          include: { tokenomics: true }
        });

        if (currentTokenomics) {
          // Find entries to update, delete, or create
          const toUpdateTokenomic = findToUpdate(currentTokenomics.tokenomics, tokenomics.tokenomics);
          const toDeleteTokenomic = findToDelete(currentTokenomics.tokenomics, tokenomics.tokenomics);
          const toCreateTokenomic = findToCreate(currentTokenomics.tokenomics, tokenomics.tokenomics);

          const operations = [];

          if (toUpdateTokenomic.length > 0) {
            operations.push(...toUpdateTokenomic.map(t => prisma.tokenomic.update({
              where: { id: t.id },
              data: {
                name: t.name,
                amount: t.amount,
                value: t.value,
                tge: t.tge,
                freq: t.freq,
                length: t.length,
                lockup: t.lockup,
                walletAddress: t.walletAddress,
                tokenomicsId: currentTokenomics.id
              }
            })));
          }

          if (toDeleteTokenomic.length > 0) {
            operations.push(prisma.tokenomic.deleteMany({ where: { id: { in: toDeleteTokenomic.map(t => t.id) } } }));
          }

          if (toCreateTokenomic.length > 0) {
            operations.push(prisma.tokenomic.createMany({
              data: toCreateTokenomic.map(t => ({
                name: t.name,
                amount: t.amount,
                value: t.value,
                tge: t.tge,
                freq: t.freq,
                length: t.length,
                lockup: t.lockup,
                walletAddress: t.walletAddress,
                tokenomicsId: currentTokenomics.id
              }))
            }));
          }

          await Promise.all(operations);

          // Update tokenomics
          await prisma.tokenomics.update({
            where: { id: currentTokenomics.id },
            data: {
              tokenName: tokenomics.tokenName,
              totalTokens: tokenomics.totalTokens,
              tokenTicker: tokenomics.tokenTicker,
              policyId: tokenomics.tokenPolicyId,
              // Note that `tokenomics` is not included here
            }
          });
        } else if (tokenomics.tokenomics && tokenomics.tokenomics.length > 0) {
          // Create tokenomics and tokenomic entries if they don't exist and if there are tokenomic items to create
          await prisma.tokenomics.create({
            data: {
              tokenName: tokenomics.tokenName,
              totalTokens: tokenomics.totalTokens,
              tokenTicker: tokenomics.tokenTicker,
              policyId: tokenomics.tokenPolicyId,
              project_slug: slug,
              tokenomics: {
                create: tokenomics.tokenomics.map(t => ({
                  name: t.name,
                  amount: t.amount,
                  value: t.value,
                  tge: t.tge,
                  freq: t.freq,
                  length: t.length,
                  lockup: t.lockup,
                  walletAddress: t.walletAddress,
                }))
              }
            }
          });
        }

        // Update team members
        const currentTeam = await prisma.team.findMany({ where: { project_slug: slug } });
        const toUpdateTeam = findToUpdate(currentTeam, team);
        const toDeleteTeam = findToDelete(currentTeam, team);
        const toCreateTeam = findToCreate(currentTeam, team);

        const updateTeamPromises = toUpdateTeam.length > 0
          ? toUpdateTeam.map(t => prisma.team.update({
            where: { id: t.id },
            data: { ...t, project_slug: slug }
          }))
          : [];

        const deleteTeamPromise = toDeleteTeam.length > 0
          ? prisma.team.deleteMany({ where: { id: { in: toDeleteTeam.map(t => t.id) } } })
          : Promise.resolve();

        const createTeamPromise = toCreateTeam.length > 0
          ? prisma.team.createMany({ data: toCreateTeam.map(t => ({ ...t, project_slug: slug })) })
          : Promise.resolve();

        await Promise.all([...updateTeamPromises, deleteTeamPromise, createTeamPromise]);

        // Update whitelists
        const currentWhitelists = await prisma.whitelist.findMany({ where: { project_slug: slug } });
        const toUpdateWhitelists = findToUpdate(currentWhitelists, whitelists);
        const toDeleteWhitelists = findToDelete(currentWhitelists, whitelists);
        const toCreateWhitelists = findToCreate(currentWhitelists, whitelists);

        const updateWhitelistsPromises = toUpdateWhitelists.length > 0
          ? toUpdateWhitelists.map(w => prisma.whitelist.update({
            where: { id: w.id },
            data: { ...w, project_slug: slug }
          }))
          : [];

        const deleteWhitelistsPromise = toDeleteWhitelists.length > 0
          ? prisma.whitelist.deleteMany({ where: { id: { in: toDeleteWhitelists.map(w => w.id) } } })
          : Promise.resolve();

        const createWhitelistsPromise = toCreateWhitelists.length > 0
          ? prisma.whitelist.createMany({ data: toCreateWhitelists.map(w => ({ ...w, project_slug: slug })) })
          : Promise.resolve();

        await Promise.all([...updateWhitelistsPromises, deleteWhitelistsPromise, createWhitelistsPromise]);


        // Update FISOs
        const currentFisos = await prisma.fiso.findMany({
          where: { projectSlug: slug },
        });

        const toUpdateFisos = findToUpdate(currentFisos, fisos);
        const toDeleteFisos = findToDelete(currentFisos, fisos);
        const toCreateFisos = findToCreate(currentFisos, fisos);

        const updatePromises = toUpdateFisos.length > 0
          ? toUpdateFisos.map(f => {
            const { approvedStakepools, spoSignups, ...updateData } = f;
            return prisma.fiso.update({
              where: { id: f.id },
              data: { ...updateData, projectSlug: slug }
            });
          })
          : [];

        const deletePromise = toDeleteFisos.length > 0
          ? prisma.fiso.deleteMany({ where: { id: { in: toDeleteFisos.map(f => f.id) } } })
          : Promise.resolve();

        const createPromise = toCreateFisos.length > 0
          ? prisma.fiso.createMany({ data: toCreateFisos.map(f => ({ ...f, projectSlug: slug })) })
          : Promise.resolve();

        await Promise.all([...updatePromises, deletePromise, createPromise]);


        // Update the main project data
        const updatedProject = await prisma.project.update({
          where: { slug },
          data: {
            ...rest,
            socials: {
              upsert: {
                create: socials,
                update: socials,
                where: { project_slug: slug }
              }
            },
          },
          include: {
            socials: true,
            roadmap: true,
            team: true,
            tokenomics: { include: { tokenomics: true } },
            whitelists: true,
            fisos: true
          }
        });

        return updatedProject;
      } catch (error) {
        console.error(error);
        throw new Error('An error occurred while updating the project');
      }
    }),
  getProject: publicProcedure
    .input(z.object({
      slug: z.string().nullish(),
    }))
    .query(async ({ input }) => {
      if (input.slug) {
        const project = await prisma.project.findUnique({
          where: {
            slug: input.slug,
          },
          include: {
            socials: true,
            roadmap: true,
            team: true,
            tokenomics: {
              include: {
                tokenomics: true,
              },
            },
            whitelists: true
            // fisos: true
          },
        });

        if (!project) {
          throw new Error("Project not found");
        }

        // fiso logic left out, will fetch this separately

        const mappedProject = mapFullProjectFromDb(project)

        return mappedProject;
      }
      else return undefined
    }),
  getProjectList: publicProcedure
    .input(z.object({
      socials: z.boolean().optional(),
      roadmap: z.boolean().optional(),
      team: z.boolean().optional(),
      tokenomics: z.boolean().optional(),
      whitelists: z.boolean().optional(),
      fisos: z.boolean().optional()
    }))
    .query(async ({ input }) => {
      try {
        const include = {
          socials: input.socials || false,
          roadmap: input.roadmap || false,
          team: input.team || false,
          tokenomics: input.tokenomics ? {
            include: {
              tokenomics: true,
            },
          } : false,
          whitelists: input.whitelists || false,
          fisos: input.fisos || false,
        };

        // Make the Prisma query
        const projects = await prisma.project.findMany({
          include,
        });

        return projects
      } catch (error: any) {
        throw new Error(error.message || "Unable to fetch projects")
      }
    }),
  getProjectFisos: publicProcedure
    .input(z.object({
      slug: z.string().nullish(),
    }))
    .query(async ({ input }) => {
      if (input.slug) {
        const fisos = await prisma.fiso.findMany({
          where: {
            projectSlug: input.slug,
          },
          include: {
            approvedStakepools: true,
            spoSignups: true
          },
        });

        if (!fisos) {
          throw new Error("No FISOs associated with this project");
        }

        return fisos;
      }
      else throw new Error("No project slug provided");
    }),
})