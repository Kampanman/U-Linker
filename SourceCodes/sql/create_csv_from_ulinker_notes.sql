SELECT
    contents_id,
    title,
    -- urlが空文字の場合は "" に変換、それ以外（NULL含む）はそのまま
    CASE
        WHEN url = '' THEN '""'
        ELSE url
    END AS url,
    url_sub,
    -- note内の改行コード(CRLF, LF)を "\n" 文字列に変換
    REPLACE(REPLACE(note, '\r', ''), '\n', '\\n') AS note,
    publicity,
    relate_notes,
    -- relate_video_urls内の改行コード(CRLF, LF)を "\n" 文字列に変換
    REPLACE(REPLACE(relate_video_urls, '\r', ''), '\n', '\\n') AS relate_video_urls,
    created_at,
    updated_at,
    created_user_id
FROM
    ulinker_notes;