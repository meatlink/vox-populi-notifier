#!/bin/bash

#url="$URL"
url="https://tinao.mos.ru/publichnye_slushaniya/opoveshcheniya_o_provedenii_publichnykh_slushaniy/index_old.php"
html_name_prefix="${HTML_NAME_PREFIX:-"html"}"
current_html_directory="${CURRENT_HTML_DIRECTORY:-"./html/current"}"
previous_html_directory="${PREVIOUS_HTML_DIRECTORY:-"./html/previous"}"
old_html_directory="${OLD_HTML_DIRECTORY:-"./html/old"}"
archive_cmd="${ARCHIVE_CMD:-"./default_archive.sh"}"

new_name="${html_name_prefix}-$( date +%F-%H%M ).html"



main () {
rotate
archive_if_neccessary
download_new
run_compare_script
}

rotate () {
echo "Rotate html files."
move_files "$previous_html_directory" "$old_html_directory"
move_files "$current_html_directory" "$previous_html_directory"
}

move_files () {
test "$( find ./html/current -type f | wc -l )" -gt "0" || return
mv "$1"/* "$2"/
}

archive_if_neccessary () {
echo "Archiving old files."
"$archive_cmd" "$old_html_directory"
}

download_new () {
echo "Downloading new html."
curl -s "$url" -o "$current_html_directory/$new_name"
}

run_compare_script () {
echo "Running compare script. It would call notifier if neccessary."
node ./compare_current_with_previous.js
}

main
