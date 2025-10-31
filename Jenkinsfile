// Jenkinsfile (Updated for NodeJS Tool)

pipeline {
    // Tell Jenkins which tools this pipeline needs.
    // The name 'NodeJS-22' MUST exactly match the name you gave the tool in the Jenkins UI.
    agent any
    tools {
        nodejs 'node22'
    }

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
                    // This command now runs using the NodeJS tool we defined.
                    // 'corepack enable' makes sure the correct version of yarn is used.
                    sh 'corepack enable && yarn install'

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
