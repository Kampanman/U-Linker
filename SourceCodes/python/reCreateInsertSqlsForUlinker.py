import tkinter as tk
from tkinter import filedialog
import csv
import os
import datetime

# 定数
EXPECTED_FILENAME_PART = "ulinker_"
HEADER_KEY_NOTE = "note"
HEADER_KEY_TAGS = "tags"
TABLE_TYPE_NOTES = "notes"
TABLE_TYPE_VIDEOS = "videos"
OUTPUT_SQL_DIR_NAME = "created_insert_sql" # 出力ディレクトリ名

def main():
  root = tk.Tk()
  root.withdraw() # tkinterのルートウィンドウを非表示にする
  print("INSERT文を生成する対象のCSVファイルを選択してください。")

  sql_output_filepath = None # SQL出力ファイルパスを初期化

  try:
    filepath = filedialog.askopenfilename(
      title="CSVファイルを選択してください",
      filetypes=[("CSV files", "*.csv"), ("All files", "*.*")]
    )

    if not filepath:
      print("ファイルが選択されませんでした。処理を中断します。")
      return

    filename = os.path.basename(filepath)

    # 選択されたファイルがCSVファイルかチェック
    if not filename.lower().endswith(".csv"):
      print(f"エラー: 選択されたファイル '{filename}' はCSVファイルではありません。")
      return

    # 選択されたファイル名に 'ulinker_' が含まれているかチェック
    if EXPECTED_FILENAME_PART not in filename:
      print(f"エラー: 選択されたファイル '{filename}' は本処理の実行対象ではありません ('{EXPECTED_FILENAME_PART}'を含んでいません)。")
      return

    print(f"選択されたファイル: {filepath}")

    # 出力ディレクトリとSQLファイルの準備
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, OUTPUT_SQL_DIR_NAME)

    # 出力ディレクトリを作成 (存在する場合は何もしない)
    os.makedirs(output_dir, exist_ok=True)
    print(f"SQL出力ディレクトリ: {output_dir}")

    # SQLファイル名を生成 (yyyyMMddHHMMSS形式)
    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    sql_filename = f"ulinker_insert_sql_{timestamp}.sql"
    sql_output_filepath = os.path.join(output_dir, sql_filename)
    print(f"出力SQLファイル名: {sql_filename}")

    # CSVファイルとSQL出力ファイルを同時に開く
    with open(filepath, 'r', encoding='utf-8-sig', newline='') as csvfile, \
      open(sql_output_filepath, 'w', encoding='utf-8') as outfile:
      reader = csv.reader(csvfile)
      
      try:
        header = next(reader)
      except StopIteration:
        print(f"エラー: ファイル '{filename}' が空か、ヘッダー行が読み取れませんでした。")
        if os.path.exists(sql_output_filepath): # エラー時は空のSQLファイルを削除
          os.remove(sql_output_filepath)
        return

      if not header:
        print(f"エラー: ファイル '{filename}' のヘッダー行が空です。")
        if os.path.exists(sql_output_filepath): # エラー時は空のSQLファイルを削除
          os.remove(sql_output_filepath)
        return

      print(f"読み込んだヘッダー: {', '.join(header)}")
      outfile.write(f"-- CSV File: {filename}\n")
      outfile.write(f"-- Headers: {', '.join(header)}\n\n")

      header_lower_stripped = [h.strip().lower() for h in header]
      which_table_type = None

      if HEADER_KEY_NOTE in header_lower_stripped:
        which_table_type = TABLE_TYPE_NOTES
      elif HEADER_KEY_TAGS in header_lower_stripped:
        which_table_type = TABLE_TYPE_VIDEOS
      
      if not which_table_type:
        print(f"エラー: ヘッダー行に '{HEADER_KEY_NOTE}' または '{HEADER_KEY_TAGS}' のいずれも含まれていません。")
        if os.path.exists(sql_output_filepath): # エラー時は空のSQLファイルを削除
          os.remove(sql_output_filepath)
        return

      table_name = f"ulinker_{which_table_type}"
      formatted_header_cols = ", ".join([f"`{col_name.strip()}`" for col_name in header])

      data_row_count = 0
      for file_line_num, row_data in enumerate(reader, start=2):
        if not any(s.strip() for s in row_data):
          print(f"{file_line_num}行目は空行または空白のみのためスキップします。")
          continue

        if len(row_data) != len(header):
          print(f"警告: {file_line_num}行目の列数({len(row_data)})がヘッダーの列数({len(header)})と異なります。この行をスキップします。")
          outfile.write(f"-- SKIPPED (line {file_line_num}): Column count mismatch. Expected {len(header)}, got {len(row_data)}.\n")
          continue
        
        formatted_values = []
        for val in row_data:
          if val == "'NULL'" or val == '"NULL"' or val == "NULL": # 引用符なしの "NULL" もSQLのNULLに変換
            formatted_values.append("NULL")
          else:
            # 1. 改行コード『\\n』を『\n』に変換
            processed_val = val.replace('\\\\n', '\n')
            # 2. 『'"』や『"'』を『"』に統一
            processed_val = processed_val.replace('\'"', '"').replace('"\'', '"')
            # 3. 『""』や『''』は空文字に統一
            processed_val = processed_val.replace('""', '').replace('\'\'', '')
            formatted_values.append(f"'{processed_val}'")
        
        sql_values_part = ", ".join(formatted_values)
        sql_statement = f"INSERT INTO `{table_name}` ({formatted_header_cols}) VALUES ({sql_values_part});"
        outfile.write(sql_statement + "\n") # SQLファイルに書き込み
        print(f"{file_line_num}行目をSQL文に変換し、ファイルに書き込みました。")
        data_row_count += 1
      
      if data_row_count == 0:
        print("処理対象のデータ行が見つかりませんでした。")
        outfile.write("-- No data rows found to process.\n")
      else:
        print(f"合計 {data_row_count} 件のデータ行からSQL文を生成し、ファイルに書き込みました。")
        outfile.write(f"\n-- Total {data_row_count} INSERT statements generated.\n")
      
      print(f"処理が正常に完了しました。SQLファイル: {sql_output_filepath}")

  except FileNotFoundError:
    print(f"エラー: 指定されたファイルが見つかりません。")
    if sql_output_filepath and os.path.exists(sql_output_filepath): # エラー時は作成途中のSQLファイルを削除
      try:
        os.remove(sql_output_filepath)
        print(f"作成途中のSQLファイル {sql_output_filepath} を削除しました。")
      except OSError as oe:
        print(f"作成途中のSQLファイル {sql_output_filepath} の削除に失敗しました: {oe}")
  except Exception as e:
    print(f"予期せぬエラーが発生しました: {e}")
    if sql_output_filepath and os.path.exists(sql_output_filepath): # エラー時は作成途中のSQLファイルを削除
      try:
        os.remove(sql_output_filepath)
        print(f"作成途中のSQLファイル {sql_output_filepath} を削除しました。")
      except OSError as oe:
        print(f"作成途中のSQLファイル {sql_output_filepath} の削除に失敗しました: {oe}")
  finally:
    input("Enterを押すと本処理を終了します。")

if __name__ == "__main__":
  main()
