# Use the official Python 3.11.8-slim image as the base
FROM python:3.11.8-slim

# Set the working directory to /app
WORKDIR /backend

# Copy the requirements file to the working directory
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code to the working directory
COPY . .

# Expose the port (if necessary)
EXPOSE 1234

# Run the command to start the application
CMD ["python", "app.py"]