import os
import numpy as np
import pandas as pd

job_postings = pd.read_csv("job_postings.csv")

print(job_postings.keys())
print(job_postings.head())