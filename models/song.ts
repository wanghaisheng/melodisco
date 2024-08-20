import { Song } from "@/types/song";
import { getDb } from "@/models/db";
import { Prisma } from "@prisma/client";

export async function insertRow(song: Song) {
  const prisma = getDb();
  const res = await prisma.song.create({
    data: {
      uuid: song.uuid,
      video_url: song.video_url,
      audio_url: song.audio_url,
      image_url: song.image_url,
      image_large_url: song.image_large_url,
      llm_model: song.llm_model,
      tags: song.tags,
      lyrics: song.lyrics,
      description: song.description,
      duration: song.duration,
      type: song.type,
      user_uuid: song.user_uuid,
      title: song.title,
      play_count: song.play_count,
      upvote_count: song.upvote_count,
      created_at: song.created_at,
      status: song.status,
      is_public: song.is_public,
      is_trending: song.is_trending,
      provider: song.provider,
      artist: song.artist,
      prompt: song.prompt,
    }
  });

  return res;
}

export async function updateSong(song: Song) {
  const prisma = getDb();
  const res = await prisma.song.update({
    where: { uuid: song.uuid },
    data: {
      video_url: song.video_url,
      audio_url: song.audio_url,
      image_url: song.image_url,
      image_large_url: song.image_large_url,
      llm_model: song.llm_model,
      tags: song.tags,
      lyrics: song.lyrics,
      description: song.description,
      duration: song.duration,
      type: song.type,
      user_uuid: song.user_uuid,
      title: song.title,
      play_count: song.play_count,
      upvote_count: song.upvote_count,
      created_at: song.created_at,
      status: song.status,
      is_public: song.is_public,
      is_trending: song.is_trending,
      provider: song.provider,
      artist: song.artist,
      prompt: song.prompt,
    }
  });

  return res;
}

export async function getUuids(): Promise<string[]> {
  const prisma = getDb();
  const songs = await prisma.song.findMany({
    select: { uuid: true }
  });
  return songs.map(song => song.uuid);
}

export async function getTotalCount(): Promise<number> {
  const prisma = getDb();
  return prisma.song.count();
}

export async function findByUuid(uuid: string): Promise<Song | undefined> {
  const prisma = getDb();
  const song = await prisma.song.findUnique({
    where: { uuid }
  });
  if (!song || !song.uuid) return undefined; // Return undefined if uuid is missing

  return formatSong(song);
}

export async function getLatestSongs(
  page: number,
  limit: number
): Promise<Song[] | undefined> {
  if (page <= 0) {
    page = 1;
  }
  if (limit <= 0) {
    limit = 50;
  }
  const offset = (page - 1) * limit;

  const prisma = getDb();
  const songs = await prisma.song.findMany({
    where: {
      status: 'complete',
      audio_url: { not: '' }
    },
    orderBy: { created_at: 'desc' },
    take: limit,
    skip: offset
  });

  return getSongsFromPrismaResult(songs);
}

export async function getProviderLatestSongs(
  provider: string,
  page: number,
  limit: number
): Promise<Song[] | undefined> {
  if (page <= 0) {
    page = 1;
  }
  if (limit <= 0) {
    limit = 50;
  }
  const offset = (page - 1) * limit;

  const prisma = getDb();
  const songs = await prisma.song.findMany({
    where: {
      provider,
      status: 'complete',
      audio_url: { not: '' }
    },
    orderBy: { created_at: 'desc' },
    take: limit,
    skip: offset
  });

  return getSongsFromPrismaResult(songs);
}

export async function getRandomSongs(
  page: number,
  limit: number
): Promise<Song[] | undefined> {
  if (page <= 0) {
    page = 1;
  }
  if (limit <= 0) {
    limit = 50;
  }
  const offset = (page - 1) * limit;

  const prisma = getDb();
  const songs = await prisma.song.findMany({
    where: {
      status: 'complete',
      audio_url: { not: '' }
    },
    orderBy: { created_at: 'desc' },
    take: limit,
    skip: offset
  });

  return getSongsFromPrismaResult(songs.sort(() => Math.random() - 0.5));
}

export async function getProviderRandomSongs(
  provider: string,
  page: number,
  limit: number
): Promise<Song[] | undefined> {
  if (page <= 0) {
    page = 1;
  }
  if (limit <= 0) {
    limit = 50;
  }
  const offset = (page - 1) * limit;

  const prisma = getDb();
  const songs = await prisma.song.findMany({
    where: {
      provider,
      status: 'complete',
      audio_url: { not: '' }
    },
    orderBy: { created_at: 'desc' },
    take: limit,
    skip: offset
  });

  return getSongsFromPrismaResult(songs.sort(() => Math.random() - 0.5));
}

export async function getTrendingSongs(
  page: number,
  limit: number
): Promise<Song[] | undefined> {
  if (page <= 0) {
    page = 1;
  }
  if (limit <= 0) {
    limit = 50;
  }
  const offset = (page - 1) * limit;

  const prisma = getDb();
  const songs = await prisma.song.findMany({
    where: {
      status: 'complete',
      audio_url: { not: '' }
    },
    orderBy: [
      { play_count: 'desc' },
      { upvote_count: 'desc' }
    ],
    take: limit,
    skip: offset
  });

  return getSongsFromPrismaResult(songs);
}

export async function getProviderTrendingSongs(
  provider: string,
  page: number,
  limit: number
): Promise<Song[] | undefined> {
  if (page <= 0) {
    page = 1;
  }
  if (limit <= 0) {
    limit = 50;
  }
  const offset = (page - 1) * limit;

  const prisma = getDb();
  const songs = await prisma.song.findMany({
    where: {
      provider,
      status: 'complete',
      audio_url: { not: '' }
    },
    orderBy: [
      { play_count: 'desc' },
      { upvote_count: 'desc' }
    ],
    take: limit,
    skip: offset
  });

  return getSongsFromPrismaResult(songs);
}

export async function getUserSongs(
  user_uuid: string,
  page: number,
  limit: number
): Promise<Song[] | undefined> {
  if (page <= 0) {
    page = 1;
  }
  if (limit <= 0) {
    limit = 50;
  }
  const offset = (page - 1) * limit;

  const prisma = getDb();
  const songs = await prisma.song.findMany({
    where: {
      user_uuid,
      status: 'complete'
    },
    orderBy: { created_at: 'desc' },
    take: limit,
    skip: offset
  });

  return getSongsFromPrismaResult(songs);
}

export function getSongsFromPrismaResult(songs: Prisma.SongCreateInput[]): Song[] {
  if (songs.length===0) return []; // Return undefined if uuid is missing

  return songs.map(formatSong).filter((song): song is Song => 
    song !== undefined && song.status !== "forbidden"
  );
}

export async function increasePlayCount(song_uuid: string) {
  const prisma = getDb();
  return prisma.song.update({
    where: { uuid: song_uuid },
    data: { play_count: { increment: 1 } }
  });
}

export function isSongSensitive(song: Song): boolean {
  const sensitiveKeywords = process.env.SENSITIVE_KEYWORDS || "";
  const keywordsArr = sensitiveKeywords.split(",");
  for (let i = 0, l = keywordsArr.length; i < l; i++) {
    const keyword = keywordsArr[i].trim();
    if (!keyword) {
      continue;
    }
    if (
      (song.title && song.title.includes(keyword)) ||
      (song.description && song.description.includes(keyword)) ||
      (song.tags && song.tags.includes(keyword)) ||
      (song.lyrics && song.lyrics.includes(keyword))
    ) {
      console.log("song is sensitive: ", song.uuid, song.title, keyword);
      return true;
    }
  }

  return false;
}

export function formatSong(row: Prisma.SongCreateInput): Song | undefined {
  if (!row.uuid) return undefined; // Return undefined if uuid is missing


  let song: Song = {
    uuid: row.uuid,
    video_url: row.video_url ?? '',
    audio_url: row.audio_url ?? '',
    image_url: row.image_url ?? '',
    image_large_url: row.image_large_url ?? '',
    llm_model: row.llm_model ?? '',
    tags: row.tags ?? '',
    lyrics: row.lyrics ?? '',
    description: row.description ?? '',
    duration: row.duration ?? 0,
    type: row.type ?? '',
    user_uuid: row.user_uuid ?? '',
    title: row.title ?? '',
    play_count: row.play_count ?? 0,
    upvote_count: row.upvote_count ?? 0,
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : new Date().toISOString(),
    status: row.status ?? '',
    is_public: row.is_public ?? true,
    is_trending: row.is_trending ?? false,
    provider: row.provider ?? '',
    artist: row.artist ?? '',
    prompt: row.prompt ?? '',
  };

  if (!song.image_url) {
    song.image_url = "/cover.png";
    song.image_large_url = "/cover.png";
  }

  if (isSongSensitive(song)) {
    song.status = "forbidden";
  }

  return song;
}