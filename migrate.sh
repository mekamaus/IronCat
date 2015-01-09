#!/bin/bash
rm db.sqlite3
echo no | python3.4 manage.py syncdb
echo
