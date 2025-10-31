// Jenkinsfile

pipeline {
    // Run this pipeline on any available Jenkins agent/node
    agent any

    // Define the stages of our pipeline
    stages {
        // Stage 1: Checkout the source code from Git
        stage('Checkout') {
            steps {
                // This is a built-in Jenkins step to clone the repository
                // configured in the Jenkins job.
                echo 'Checking out the source code...'
                checkout scm
            }
        }

        // Stage 2: Build the main OpenCTI Platform Docker image
        stage('Build OpenCTI Platform Image') {
            steps {
                script {
                    echo 'Building the OpenCTI Platform image...'
                    // Build the Docker image. The Dockerfile is in the 'opencti-platform' subdirectory.
                    // We will tag it as 'opencti-platform:local-build'
                    // The 'true' at the end tells Jenkins the context directory is 'opencti-platform'
                    docker.build('opencti-platform:local-build', './opencti-platform')
                }
            }
        }

        // Stage 3: Build the OpenCTI Worker Docker image
        stage('Build OpenCTI Worker Image') {
            steps {
                script {
                    echo 'Building the OpenCTI Worker image...'
                    // Build the worker image. The Dockerfile is in the 'opencti-worker' subdirectory.
                    // We will tag it as 'opencti-worker:local-build'
                    docker.build('opencti-worker:local-build', './opencti-worker')
                }
            }
        }
    }

    // Post-build actions: This block runs after all stages are complete
    post {
        success {
            echo 'Pipeline finished successfully!'
            echo 'Local images are ready. Use `docker images` to see them.'
        }
        failure {
            echo 'Pipeline failed. Check the console output for errors.'
        }
    }
}
