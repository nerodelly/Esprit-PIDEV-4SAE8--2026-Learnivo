// ─────────────────────────────────────────────────────────────────────────────
// Learnivo — Jenkins Pipeline (user-service, claims-service, frontend)
// ─────────────────────────────────────────────────────────────────────────────

pipeline {
    agent any

    environment {
        LOCAL_REGISTRY = 'localhost:5000'
        SONAR_HOST_URL = 'http://learnivo-sonarqube:9000'
    }

    tools {
        maven 'Maven 3.9.6'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // ── Phase 1: CI sub-jobs ──────────────────────────────────────────────
        stage('CI — claims & user') {
            parallel {
                stage('CI: claims-service') {
                    steps {
                        build job: 'ci-claims-service', wait: true, propagate: false
                    }
                }
                stage('CI: user-service') {
                    steps {
                        build job: 'ci-user-service', wait: true, propagate: false
                    }
                }
            }
        }

        // ── Phase 2: Maven Build ──────────────────────────────────────────────
        stage('Maven Build') {
            steps {
                sh 'mvn clean package -pl user-service,claims-service -am -DskipTests --batch-mode -q'
            }
        }

        // ── Phase 3: Unit Tests ───────────────────────────────────────────────
        stage('Unit Tests') {
            steps {
                sh 'mvn test -pl user-service,claims-service --batch-mode -q -Dsurefire.excludes="**/*ApplicationTests.class,**/*IntegrationTest*.class,**/DemoApplicationTests.class" || true'
            }
            post {
                always {
                    junit allowEmptyResults: true,
                          testResults: '**/target/surefire-reports/*.xml'
                }
            }
        }

        // ── Phase 4: SonarQube Analysis ───────────────────────────────────────
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
                        sh 'mvn sonar:sonar -pl user-service,claims-service -Dsonar.projectKey=learnivo -Dsonar.projectName="Learnivo Microservices" -Dsonar.java.binaries=**/target/classes -Dsonar.login=${SONAR_TOKEN} --batch-mode -q || true'
                    }
                }
            }
        }

        // ── Phase 5: Docker Build & Push (3 services only) ───────────────────
        stage('Build Docker Images') {
            parallel {
                stage('user-service') {
                    steps {
                        sh "docker build -t ${LOCAL_REGISTRY}/user-service:latest -t ${LOCAL_REGISTRY}/user-service:${BUILD_NUMBER} -f user-service/Dockerfile ."
                        sh "docker push ${LOCAL_REGISTRY}/user-service:latest"
                        sh "docker push ${LOCAL_REGISTRY}/user-service:${BUILD_NUMBER}"
                    }
                }
                stage('claims-service') {
                    steps {
                        sh "docker build -t ${LOCAL_REGISTRY}/claims-service:latest -t ${LOCAL_REGISTRY}/claims-service:${BUILD_NUMBER} -f claims-service/Dockerfile ."
                        sh "docker push ${LOCAL_REGISTRY}/claims-service:latest"
                        sh "docker push ${LOCAL_REGISTRY}/claims-service:${BUILD_NUMBER}"
                    }
                }
                stage('frontend') {
                    steps {
                        sh "docker build -t ${LOCAL_REGISTRY}/frontend:latest -t ${LOCAL_REGISTRY}/frontend:${BUILD_NUMBER} -f frontend/Dockerfile frontend/"
                        sh "docker push ${LOCAL_REGISTRY}/frontend:latest"
                        sh "docker push ${LOCAL_REGISTRY}/frontend:${BUILD_NUMBER}"
                    }
                }
            }
        }

        // ── Phase 6: Deploy to Kubernetes ─────────────────────────────────────
        stage('Deploy to Kubernetes') {
            when {
                expression {
                    try {
                        withCredentials([file(credentialsId: 'kubeconfig', variable: 'K')]) { return true }
                    } catch (e) {
                        echo "kubeconfig not configured — skipping K8s deploy"
                        return false
                    }
                }
            }
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh 'export KUBECONFIG=$KUBECONFIG && find k8s/ -name "deployment.yml" -exec sed -i "s|IMAGE_TAG|${BUILD_NUMBER}|g" {} \\;'
                    sh 'export KUBECONFIG=$KUBECONFIG && kubectl apply -f k8s/namespace.yml || true'
                    sh 'export KUBECONFIG=$KUBECONFIG && kubectl apply -f k8s/user-service/ || true'
                    sh 'export KUBECONFIG=$KUBECONFIG && kubectl apply -f k8s/claims-service/ || true'
                    sh 'export KUBECONFIG=$KUBECONFIG && kubectl apply -f k8s/frontend/ || true'
                }
            }
        }
    }

    post {
        always { cleanWs() }
        success { echo '✅ Pipeline SUCCESS' }
        failure { echo '❌ Pipeline FAILED' }
    }
}
