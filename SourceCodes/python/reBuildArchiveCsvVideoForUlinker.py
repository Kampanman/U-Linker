import tkinter as tk
from tkinter import filedialog
import os

# 定数メッセージ
MSG_PROMPT_TXT_FOLDER = "更新するulinker_videosの行データ（txt）が格納されているフォルダを選択してください。"
MSG_NO_TXT_FILES = "選択されたフォルダ内に行データがありません。"
MSG_BAD_FORMAT_TXT = "選択されたフォルダ内に、形式が適切ではない行データがあります。"
MSG_UNEXPECTED_ERROR = "申し訳ありません。予期しないエラーが発生してしまった為、本処理を中止します。"
MSG_PROMPT_CSV_FILE = "更新する行データを反映するulinker_videosのCSVを選択してください。"
MSG_NOT_CSV = "選択されたファイルはCSVではありません。"
MSG_NOT_ULINKER_VIDEOS_CSV = "選択されたファイルはulinker_videosのCSVではありません。"
MSG_NO_HEADER = "選択されたファイルにはヘッダー行が設定されていないようです。"
MSG_BAD_COLUMN_COUNT_CSV = "選択されたファイルに、列数が合っていない行があるようです。"
MSG_CSV_UPDATE_COMPLETE = "CSVの上書き処理が完了しました。今回は以下のcontents_idの行内容を更新しています。"
MSG_PRESS_ENTER_TO_EXIT = "Enterを押すと本処理を終了します。"
MSG_FOLDER_CANCEL = "フォルダ選択がキャンセルされました。処理を中止します。"
MSG_FILE_CANCEL = "ファイル選択がキャンセルされました。処理を中止します。"
MSG_NO_ROWS_UPDATED = "(今回は更新された行がありませんでした)"

def main():
  root = tk.Tk()
  root.withdraw() # Tkinterのメインウィンドウを非表示にする

  try:
    print(MSG_PROMPT_TXT_FOLDER)
    txt_folder_path = filedialog.askdirectory(title=MSG_PROMPT_TXT_FOLDER)

    if not txt_folder_path: # ユーザーがフォルダ選択をキャンセルした場合
      print(MSG_FOLDER_CANCEL)
      return

    potential_txt_files_info = []
    try:
      for filename in os.listdir(txt_folder_path):
        if "csv-row_" in filename and filename.endswith(".txt"):
          potential_txt_files_info.append({
            "path": os.path.join(txt_folder_path, filename),
            "name": filename
          })
    except OSError as e:
      print(f"フォルダの読み取り中にエラーが発生しました: {e}")
      raise # 予期せぬエラーとして処理

    # ユーザーが選択したフォルダ内に「csv-row_」が名称に含まれる.txtファイルが存在していない場合
    if not potential_txt_files_info:
      print(MSG_NO_TXT_FILES)
      return

    updateContentsIds = [] # オブジェクト配列を格納できる変数「updateContentsIds」
    for txt_file_info in potential_txt_files_info:
      file_path = txt_file_info["path"]
      filename = txt_file_info["name"]
      try:
        with open(file_path, 'r', encoding='utf-8') as f:
          # 「csv-row_」が名称に含まれる.txtファイルを順番に読み込んで以下を行う
          first_line = f.readline().rstrip('\n') # 1行目の内容を、格納用オブジェクトのcontentsObject.rowに対する値に設定する

          # 「csv-row_」が名称に含まれる.txtファイルの内容における、半角カンマ（,）の個数が7ではない場合
          if first_line.count(',') != 7:
            print(MSG_BAD_FORMAT_TXT + f" (ファイル: {filename})")
            return # エラーメッセージを表示して処理中断

          
          try:
            contents_id = first_line.split(',', 1)[0] # 行頭から一つ目の半角カンマ直前の値を、contentsObject.contents_idに対する値に設定する
          except IndexError:
            print(MSG_BAD_FORMAT_TXT + f" (ID抽出エラー ファイル: {filename})")
            return
          
          contentsObject = {
            'contents_id': contents_id,
            'row': first_line # 1行目の内容全体
          }
          updateContentsIds.append(contentsObject) # updateContentsIdsにcontentsObjectを格納する

      except IOError as e:
        print(f"ファイル {filename} の読み込みエラー: {e}")
        raise # 予期せぬエラーとして処理
      except Exception as e: 
        print(f"ファイル {filename} の処理中に予期せぬエラー: {e}")
        raise # 予期せぬエラーとして処理
    
    # updateContentsIdsが空の場合（有効なTXTファイルが一つもなかった場合）でも処理は続行する。

    # CSVファイル処理
    print(MSG_PROMPT_CSV_FILE)
    csv_file_path = filedialog.askopenfilename(
      title=MSG_PROMPT_CSV_FILE,
      filetypes=(("CSV files", "*.csv"), ("All files", "*.*"))
    )

    # ユーザーがファイル選択をキャンセルした場合
    if not csv_file_path:
      print(MSG_FILE_CANCEL)
      return

    # ユーザーが選択したファイルが拡張子を.csvとするファイルではない場合
    if not csv_file_path.lower().endswith(".csv"):
      print(MSG_NOT_CSV)
      return

    # ユーザーが選択したCSVが「ulinker_videos」を名称に含む.csvファイルではない場合
    if "ulinker_videos" not in os.path.basename(csv_file_path).lower():
      print(MSG_NOT_ULINKER_VIDEOS_CSV)
      return

    csv_lines_read = []
    try:
      with open(csv_file_path, 'r', encoding='utf-8') as f:
        csv_lines_read = [line.rstrip('\n') for line in f.readlines()]
    except IOError as e:
      print(f"CSVファイル {os.path.basename(csv_file_path)} の読み込みエラー: {e}")
      raise # 予期せぬエラーとして処理
    
    if not csv_lines_read:
      print(MSG_NO_HEADER + " (ファイルが空か、読み取れませんでした)") # ファイルが空、または読み取りに失敗した場合
      return

    # ヘッダー行チェック: 1行目が「"contents_id"」で始まり「"created_user_id"」で終わる行
    header_line = csv_lines_read[0]
    if not (header_line.startswith('"contents_id"') and header_line.endswith('"created_user_id"')):
      print(MSG_NO_HEADER)
      return

    # CSVの内容において、半角カンマ（,）が7個ではない行が存在する場合
    for i, line in enumerate(csv_lines_read):
      if line.count(',') != 7:
        print(MSG_BAD_COLUMN_COUNT_CSV + f" (行 {i + 1})")
        return
    
    # エラーが発生しなかった場合は、以下の処理を実施する
    updates_map = {item['contents_id']: item['row'] for item in updateContentsIds} # CSVファイルの内容を編集する
    new_csv_content_lines = []
    updated_row_ids = [] # 上書きした行それぞれのcontents_idを格納

    # ヘッダー行はそのまま追加
    new_csv_content_lines.append(csv_lines_read[0])

    # CSVファイルの2行目以降で処理 (インデックス 1 から)
    for i in range(1, len(csv_lines_read)):
      current_csv_line = csv_lines_read[i]
      try:
        csv_row_contents_id = current_csv_line.split(',', 1)[0]
      except IndexError:
        print(MSG_BAD_COLUMN_COUNT_CSV + f" (データ行のID抽出エラー 行 {i + 1})")
        return

      # contentsObjectの各contents_id (updates_mapのキー) と CSV行のcontents_idが合致するか判定
      if csv_row_contents_id in updates_map:
        # 合致する場合、CSVの該当行をcontentsObjectのrowの内容で上書き
        new_csv_content_lines.append(updates_map[csv_row_contents_id])
        updated_row_ids.append(csv_row_contents_id)
      else:
        new_csv_content_lines.append(current_csv_line) # 合致しない場合は編集前の行をそのまま使用
    
    # 編集後の内容をCSVファイルに書き戻す
    try:
      with open(csv_file_path, 'w', encoding='utf-8') as f_out:
        for line in new_csv_content_lines:
          f_out.write(line + '\n') # 各行の末尾に改行を追加
    except IOError as e:
      print(f"CSVファイル {os.path.basename(csv_file_path)} への書き込みエラー: {e}")
      raise # 予期せぬエラーとして処理

    # 処理完了後にメッセージを表示
    print(MSG_CSV_UPDATE_COMPLETE)
    if updated_row_ids:
      print(", ".join(updated_row_ids))
    else:
      print(MSG_NO_ROWS_UPDATED)

  except Exception as e:
    print(MSG_UNEXPECTED_ERROR) # 本処理の全体において、処理中に予期せぬエラーが発生した場合
  finally:
    input(MSG_PRESS_ENTER_TO_EXIT) # 最終的にはユーザーにEnterキーを押下してもらう

if __name__ == "__main__":
  main()
