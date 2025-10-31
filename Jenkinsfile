// Jenkinsfile (Updated)

pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out the source code...'
                checkout scm
            }
        }

        stage('Build OpenCTI Platform Image') {
            steps {
                script {
                    echo "Preparing frontend build environment..."
                    // ** NEW STEP ADDED HERE **
                    // This command reads the project's configuration and creates
                    // the required `.yarn` directory that the Dockerfile needs.
                    sh 'yarn install'

                    echo 'Building the OpenCTI Platform image...'
                    docker.build('opencti-platform:local-build', './opencti-platform')
                }
            }
        }

        stage('Build OpenCTI Worker Image') {
            steps {
                script {
                    echo 'Building the OpenCTI Worker image...'
                    docker.build('opencti-worker:local-build', './opencti-worker')
                }
            }
        }
    }

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
