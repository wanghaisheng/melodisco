import { Song } from "@/types/song";
import { SongTask } from "@/types/task";
import { getDb } from "@/models/db";
import { Prisma } from "@prisma/client";
import { formatSong, getSongsFromPrismaResult } from './song'

export async function insertSongTask(task: SongTask): Promise<Prisma.SongTaskCreateInput> {
  const prisma = getDb();
  return prisma.songTask.create({
    data: formatSongTaskForPrisma(task) as Prisma.SongTaskCreateInput,
  });
}

export async function getUserSongTasksCount(user_uuid: string): Promise<number> {
  const prisma = getDb();
  return prisma.songTask.count({
    where: { user_uuid },
  });
}

export async function updateSongTask(task: SongTask): Promise<Prisma.SongTaskUpdateInput> {
  const prisma = getDb();
  return prisma.songTask.update({
    where: { uuid: task.uuid },
    data: formatSongTaskForPrisma(task) as Prisma.SongTaskUpdateInput,
  });
}

export async function findSongTaskByUuid(uuid: string): Promise<SongTask | null> {
  const prisma = getDb();
  const task = await prisma.songTask.findUnique({
    where: { uuid },
  });
  if (!task) return null;
  const formattedTask = formatSongTask(task);
  return formattedTask ?? null
 }

export async function getUserSongTasks(
  user_uuid: string,
  page: number,
  limit: number
): Promise<SongTask[]> {
  const prisma = getDb();
  if (page <= 0) page = 1;
  if (limit <= 0) limit = 50;
  const tasks = await prisma.songTask.findMany({
    where: { user_uuid },
    orderBy: { created_at: 'desc' },
    take: limit,
    skip: (page - 1) * limit,
  });
  return tasks.map(task => formatSongTask(task)).filter((task): task is SongTask => task !== undefined);
}

export async function getUserCreatedSongs(
  user_uuid: string,
  page: number,
  limit: number
): Promise<Song[]> {
  const prisma = getDb();
  try {
    if (page <= 0) page = 1;
    if (limit <= 0) limit = 50;
    const tasks = await prisma.songTask.findMany({
      where: { user_uuid },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
      select: { song_uuids: true },
    });

    const song_uuids = tasks.flatMap(ts => ts.song_uuids).filter((uuid): uuid is string => uuid !== null);

    if (song_uuids.length === 0) {
      return [];
    }

    const songs = await prisma.song.findMany({
      where: {
        uuid: { in: song_uuids },
        status: { notIn: ['forbidden', 'deleted'] },
      },
      orderBy: { created_at: 'desc' },
    });

    return getSongsFromPrismaResult(songs);
  } catch (e) {
    console.error("get user created songs failed:", e);
    return [];
  }
}

function formatSongTaskForPrisma(task: SongTask): Prisma.SongTaskCreateInput {
  if (!task.uuid) throw new Error("UUID is required for SongTask");

  return {
    uuid: task.uuid,
    user_uuid: task.user_uuid,
    created_at: task.created_at,
    updated_at: task.updated_at,
    status: task.status,
    description: task.description,
    title: task.title,
    lyrics: task.lyrics,
    tags: task.tags,
    is_no_lyrics: task.is_no_lyrics,
    lyrics_provider: task.lyrics_provider,
    lyrics_uuid: task.lyrics_uuid,
    song_provider: task.song_provider,
    song_model: task.song_model,
    song_uuids: task.song_uuids,
  };
}

function formatSongTask(row: Prisma.SongTaskCreateInput): SongTask | undefined {
  if (!row.uuid) return undefined;

  return {
    uuid: row.uuid,
    user_uuid: row.user_uuid,
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : new Date().toISOString(),
    updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : new Date().toISOString(),

    status: row.status as string ?? '',
    description: row.description ?? '',
    title: row.title ?? '',
    lyrics: row.lyrics ?? '',
    tags: row.tags ?? '',
    is_no_lyrics: row.is_no_lyrics ?? false,
    lyrics_provider: row.lyrics_provider ?? '',
    lyrics_uuid: row.lyrics_uuid ?? '',
    song_provider: row.song_provider ?? '',
    song_model: row.song_model ?? '',
    song_uuids: row.song_uuids ?? '',
  };
}