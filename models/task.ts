import { Song } from "@/types/song";
import { SongTask } from "@/types/task";
import { getDb } from "@/models/db";
import { Prisma } from "@prisma/client";

export async function insertSongTask(task: SongTask) {
  const prisma = getDb();
  return prisma.songTasks.create({
    data: formatSongTaskForPrisma(task),
  });
}

export async function getUserSongTasksCount(user_uuid: string): Promise<number> {
  const prisma = getDb();
  return prisma.songTasks.count({
    where: { user_uuid },
  });
}

export async function updateSongTask(task: SongTask) {
  const prisma = getDb();
  return prisma.songTasks.update({
    where: { uuid: task.uuid },
    data: formatSongTaskForPrisma(task),
  });
}

export async function findSongTaskByUuid(uuid: string): Promise<SongTask | null> {
  const prisma = getDb();
  const task = await prisma.songTasks.findUnique({
    where: { uuid },
  });
  return task ? formatSongTask(task) : null;
}

export async function getUserSongTasks(
  user_uuid: string,
  page: number,
  limit: number
): Promise<SongTask[] | undefined> {
  const prisma = getDb();
  if (page <= 0) page = 1;
  if (limit <= 0) limit = 50;
  const tasks = await prisma.songTasks.findMany({
    where: { user_uuid },
    orderBy: { created_at: 'desc' },
    take: limit,
    skip: (page - 1) * limit,
  });
  return tasks.map(formatSongTask);
}

export async function getUserCreatedSongs(
  user_uuid: string,
  page: number,
  limit: number
): Promise<Song[] | undefined> {
  const prisma = getDb();
  try {
    if (page <= 0) page = 1;
    if (limit <= 0) limit = 50;
    const tasks = await prisma.songTasks.findMany({
      where: { user_uuid },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
      select: { song_uuids: true },
    });

    const song_uuids = tasks.flatMap(task => JSON.parse(task.song_uuids || '[]'));

    console.log("song_uuids", song_uuids);

    const songs = await prisma.songs.findMany({
      where: {
        uuid: { in: song_uuids },
        status: { notIn: ['forbidden', 'deleted'] },
      },
      orderBy: { created_at: 'desc' },
    });

    return songs.map(formatSong);
  } catch (e) {
    console.log("get user created songs failed:", e);
    return [];
  }
}

function formatSongTaskForPrisma(task: SongTask): Prisma.songTasksCreateInput {
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

function formatSongTask(row: Prisma.songTasksCreateInput): SongTask {
  return {
    uuid: row.uuid,
    user_uuid: row.user_uuid,
    created_at: row.created_at,
    updated_at: row.updated_at,
    status: row.status,
    description: row.description,
    title: row.title,
    lyrics: row.lyrics,
    tags: row.tags,
    is_no_lyrics: row.is_no_lyrics,
    lyrics_provider: row.lyrics_provider,
    lyrics_uuid: row.lyrics_uuid,
    song_provider: row.song_provider,
    song_model: row.song_model,
    song_uuids: row.song_uuids,
  };
}

function formatSong(row: Prisma.songsCreateInput): Song {
  return {
    uuid: row.uuid,
    video_url: row.video_url,
    audio_url: row.audio_url,
    image_url: row.image_url || "/cover.png",
    image_large_url: row.image_large_url || "/cover.png",
    llm_model: row.llm_model,
    tags: row.tags,
    lyrics: row.lyrics,
    description: row.description,
    duration: row.duration,
    type: row.type,
    user_uuid: row.user_uuid,
    title: row.title,
    play_count: row.play_count,
    upvote_count: row.upvote_count,
    created_at: row.created_at,
    status: row.status,
    is_public: row.is_public,
    is_trending: row.is_trending,
    provider: row.provider,
    artist: row.artist,
    prompt: row.prompt,
  };
}