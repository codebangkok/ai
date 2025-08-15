import sqlite3
import sqlite_vec
import numpy

conn = sqlite3.connect(":memory:")
conn.enable_load_extension(True)
sqlite_vec.load(conn)

cursor = conn.cursor()
cursor.execute("""
create virtual table documents using vec0(
    vector float[3]
)
""")

# vector = numpy.array([1.0, 1.0 , 5.0], dtype=numpy.float32).tobytes()
# cursor.execute("insert into documents(vector) values(?)", (vector,))

vectors = [
    (numpy.array([1.0, 1.0 , 5.0], dtype=numpy.float32).tobytes(),),
    (numpy.array([2.0, 2.0 , 10.0], dtype=numpy.float32).tobytes(),),
    (numpy.array([3.0, 3.0 , 8.0], dtype=numpy.float32).tobytes(),),
    (numpy.array([4.0, 1.0 , 7.0], dtype=numpy.float32).tobytes(),),
    (numpy.array([1.0, 2.0 , 5.0], dtype=numpy.float32).tobytes(),),    
]
cursor.executemany("insert into documents(vector) values(?)", vectors)

query_vector = (numpy.array([1.0, 1.0, 4.0], dtype=numpy.float32).tobytes(),)

cursor.execute("""
select
    rowid,
    distance,
    vector
from documents
where vector match ?
order by distance
limit 5
""", query_vector)

rows = cursor.fetchall()
for id, distance, vector in rows:
    print(f"{id} - {numpy.frombuffer(vector, dtype=numpy.float32)} - {distance}")