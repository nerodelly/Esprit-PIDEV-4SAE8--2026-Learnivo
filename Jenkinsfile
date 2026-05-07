// ─────────────────────────────────────────────────────────────────────────────
// Learnivo — Global Jenkins Pipeline
// Stages: Checkout → Build → Test → SonarQube → Docker Build+Push → K8s Deploy
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

        // ── Phase 1: CI — claims-service and user-service ─────────────────────
        stage('CI — claims-service & user-service') {
            parallel {
                stage('CI: claims-service') {
                    steps {
                        build job: 'ci-claims-service',
                              wait: true,
                              propagate: false
                    }
                }
                stage('CI: user-service') {
                    steps {
                        build job: 'ci-user-service',
                              wait: true,
                              propagate: false
                    }
                }
            }
        }

        // ── Phase 2: Maven Build (all modules) ────────────────────────────────
        stage('Maven Build') {
            steps {
                sh 'mvn clean package -DskipTests --batch-mode -q'
            }
        }

        // ── Phase 3: Unit Tests ───────────────────────────────────────────────
        stage('Unit Tests') {
            steps {
                sh 'mvn test --batch-mode -q || true'
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
                        sh '''mvn sonar:sonar \
                              -Dsonar.projectKey=learnivo \
                              -Dsonar.projectName="Learnivo Microservices" \
                              -Dsonar.java.binaries=**/target/classes \
                              -Dsonar.login=${SONAR_TOKEN} \
                              --batch-mode -q || true'''
                    }
                }
            }
        }

        // ── Phase 5: Build & Push Docker images to local registry ─────────────
        stage('Build Docker Images') {
            parallel {
                stage('user-service') {
                    steps {
                        sh """
                            docker build -t ${LOCAL_REGISTRY}/user-service:latest \
                                         -t ${LOCAL_REGISTRY}/user-service:${BUILD_NUMBER} \
                                         -f user-service/Dockerfile .
                            docker push ${LOCAL_REGISTRY}/user-service:latest
                            docker push ${LOCAL_REGISTRY}/user-service:${BUILD_NUMBER}
                        """
                    }
                }
                stage('claims-service') {
                    steps {
                        sh """
                            docker build -t ${LOCAL_REGISTRY}/claims-service:latest \
                                         -t ${LOCAL_REGISTRY}/claims-service:${BUILD_NUMBER} \
                                         -f claims-service/Dockerfile .
                            docker push ${LOCAL_REGISTRY}/claims-service:latest
                            docker push ${LOCAL_REGISTRY}/claims-service:${BUILD_NUMBER}
                        """
                    }
                }
                stage('api-gateway') {
                    steps {
                        sh """
                            docker build -t ${LOCAL_REGISTRY}/api-gateway:latest \
                                         -t ${LOCAL_REGISTRY}/api-gateway:${BUILD_NUMBER} \
                                         -f api-gateway/Dockerfile .
                            docker push ${LOCAL_REGISTRY}/api-gateway:latest
                            docker push ${LOCAL_REGISTRY}/api-gateway:${BUILD_NUMBER}
                        """
                    }
                }
                stage('eureka-service') {
                    steps {
                        sh """
                            docker build -t ${LOCAL_REGISTRY}/eureka-service:latest \
                                         -t ${LOCAL_REGISTRY}/eureka-service:${BUILD_NUMBER} \
                                         -f eureka-service/Dockerfile .
                            docker push ${LOCAL_REGISTRY}/eureka-service:latest
                            docker push ${LOCAL_REGISTRY}/eureka-service:${BUILD_NUMBER}
                        """
                    }
                }
                stage('config-server') {
                    steps {
                        sh """
                            docker build -t ${LOCAL_REGISTRY}/config-server:latest \
                                         -t ${LOCAL_REGISTRY}/config-server:${BUILD_NUMBER} \
                                         -f config-server/Dockerfile .
                            docker push ${LOCAL_REGISTRY}/config-server:latest
                            docker push ${LOCAL_REGISTRY}/config-server:${BUILD_NUMBER}
                        """
                    }
                }
                stage('class-service') {
                    steps {
                        sh """
                            docker build -t ${LOCAL_REGISTRY}/class-service:latest \
                                         -t ${LOCAL_REGISTRY}/class-service:${BUILD_NUMBER} \
                                         -f class-service/Dockerfile .
                            docker push ${LOCAL_REGISTRY}/class-service:latest
                            docker push ${LOCAL_REGISTRY}/class-service:${BUILD_NUMBER}
                        """
                    }
                }
                stage('competition-service') {
                    steps {
                        sh """
                            docker build -t ${LOCAL_REGISTRY}/competition-service:latest \
                                         -t ${LOCAL_REGISTRY}/competition-service:${BUILD_NUMBER} \
                                         -f competition-service/Dockerfile .
                            docker push ${LOCAL_REGISTRY}/competition-service:latest
                            docker push ${LOCAL_REGISTRY}/competition-service:${BUILD_NUMBER}
                        """
                    }
                }
                stage('course-service') {
                    steps {
                        sh """
                            docker build -t ${LOCAL_REGISTRY}/course-service:latest \
                                         -t ${LOCAL_REGISTRY}/course-service:${BUILD_NUMBER} \
                                         -f course-service/Dockerfile .
                            docker push ${LOCAL_REGISTRY}/course-service:latest
                            docker push ${LOCAL_REGISTRY}/course-service:${BUILD_NUMBER}
                        """
                    }
                }
                stage('quiz-service') {
                    steps {
                        sh """
                            docker build -t ${LOCAL_REGISTRY}/quiz-service:latest \
                                         -t ${LOCAL_REGISTRY}/quiz-service:${BUILD_NUMBER} \
                                         -f quiz-service/Dockerfile .
                            docker push ${LOCAL_REGISTRY}/quiz-service:latest
                            docker push ${LOCAL_REGISTRY}/quiz-service:${BUILD_NUMBER}
                        """
                    }
                }
                stage('club-event-service') {
                    steps {
                        sh """
                            docker build -t ${LOCAL_REGISTRY}/club-event-service:latest \
                                         -t ${LOCAL_REGISTRY}/club-event-service:${BUILD_NUMBER} \
                                         -f club-event-service/Dockerfile .
                            docker push ${LOCAL_REGISTRY}/club-event-service:latest
                            docker push ${LOCAL_REGISTRY}/club-event-service:${BUILD_NUMBER}
                        """
                    }
                }
                stage('imed-service') {
                    steps {
                        sh """
                            docker build -t ${LOCAL_REGISTRY}/imed-service:latest \
                                         -t ${LOCAL_REGISTRY}/imed-service:${BUILD_NUMBER} \
                                         -f imed-service/Dockerfile .
                            docker push ${LOCAL_REGISTRY}/imed-service:latest
                            docker push ${LOCAL_REGISTRY}/imed-service:${BUILD_NUMBER}
                        """
                    }
                }
                stage('frontend') {
                    steps {
                        sh """
                            docker build -t ${LOCAL_REGISTRY}/frontend:latest \
                                         -t ${LOCAL_REGISTRY}/frontend:${BUILD_NUMBER} \
                                         -f frontend/Dockerfile frontend/
                            docker push ${LOCAL_REGISTRY}/frontend:latest
                            docker push ${LOCAL_REGISTRY}/frontend:${BUILD_NUMBER}
                        """
                    }
                }
            }
        }

        // ── Phase 6: Deploy to Kubernetes ─────────────────────────────────────
        stage('Deploy to Kubernetes') {
            when {
                // Only deploy if kubeconfig credential is configured
                expression {
                    try {
                        withCredentials([file(credentialsId: 'kubeconfig', variable: 'K')]) { return true }
                    } catch (e) {
                        echo "⚠️  kubeconfig credential not found — skipping K8s deploy"
                        return false
                    }
                }
            }
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh '''
                        export KUBECONFIG=$KUBECONFIG
                        find k8s/ -name "deployment.yml" -exec \
                            sed -i "s|IMAGE_TAG|${BUILD_NUMBER}|g" {} \\;
                        kubectl apply -f k8s/namespace.yml       || true
                        kubectl apply -f k8s/configmap.yml       || true
                        kubectl apply -f k8s/secrets.yml         || true
                        kubectl apply -f k8s/mysql/              || true
                        kubectl apply -f k8s/rabbitmq/           || true
                        kubectl apply -f k8s/eureka-service/     || true
                        kubectl apply -f k8s/config-server/      || true
                        kubectl apply -f k8s/user-service/       || true
                        kubectl apply -f k8s/claims-service/     || true
                        kubectl apply -f k8s/class-service/      || true
                        kubectl apply -f k8s/competition-service/ || true
                        kubectl apply -f k8s/course-service/     || true
                        kubectl apply -f k8s/quiz-service/       || true
                        kubectl apply -f k8s/club-event-service/ || true
                        kubectl apply -f k8s/imed-service/       || true
                        kubectl apply -f k8s/api-gateway/        || true
                        kubectl apply -f k8s/frontend/           || true
                    '''
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo '✅ Pipeline SUCCESS — all images built and pushed to local registry'
        }
        failure {
            echo '❌ Pipeline FAILED — check stage logs above'
        }
    }
}
