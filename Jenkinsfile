// ─────────────────────────────────────────────────────────────────────────────
// Learnivo — Global Jenkins Pipeline
// Orchestrates CI/CD for all microservices.
// claims-service and user-service run their own dedicated Jenkinsfiles
// (triggered as downstream jobs). All other services are built here.
// ─────────────────────────────────────────────────────────────────────────────

pipeline {
    agent any

    environment {
        IMAGE_PREFIX = 'ghcr.io/nerodelly'
        REGISTRY     = 'ghcr.io'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // ── Phase 1: CI for claims & user (dedicated pipelines) ───────────────
        stage('CI — claims-service & user-service') {
            parallel {
                stage('CI: claims-service') {
                    steps {
                        build job: 'ci-claims-service',
                              parameters: [string(name: 'BRANCH', value: env.BRANCH_NAME ?: 'main')],
                              wait: true,
                              propagate: true
                    }
                }
                stage('CI: user-service') {
                    steps {
                        build job: 'ci-user-service',
                              parameters: [string(name: 'BRANCH', value: env.BRANCH_NAME ?: 'main')],
                              wait: true,
                              propagate: true
                    }
                }
            }
        }

        // ── Phase 2: Build all service images in parallel ─────────────────────
        stage('Build Docker images') {
            parallel {

                stage('claims-service') {
                    when { branch 'main' }
                    steps {
                        withCredentials([string(credentialsId: 'ghcr-token', variable: 'GHCR_TOKEN')]) {
                            sh '''
                                echo "$GHCR_TOKEN" | docker login ghcr.io -u nerodelly --password-stdin
                                docker build -t $IMAGE_PREFIX/claims-service:$BUILD_NUMBER \
                                             -t $IMAGE_PREFIX/claims-service:latest \
                                             -f claims-service/Dockerfile claims-service/
                                docker push $IMAGE_PREFIX/claims-service:$BUILD_NUMBER
                                docker push $IMAGE_PREFIX/claims-service:latest
                            '''
                        }
                    }
                }

                stage('user-service') {
                    when { branch 'main' }
                    steps {
                        withCredentials([string(credentialsId: 'ghcr-token', variable: 'GHCR_TOKEN')]) {
                            sh '''
                                echo "$GHCR_TOKEN" | docker login ghcr.io -u nerodelly --password-stdin
                                docker build -t $IMAGE_PREFIX/user-service:$BUILD_NUMBER \
                                             -t $IMAGE_PREFIX/user-service:latest \
                                             -f user-service/Dockerfile .
                                docker push $IMAGE_PREFIX/user-service:$BUILD_NUMBER
                                docker push $IMAGE_PREFIX/user-service:latest
                            '''
                        }
                    }
                }

                stage('eureka-service') {
                    when { branch 'main' }
                    steps {
                        withCredentials([string(credentialsId: 'ghcr-token', variable: 'GHCR_TOKEN')]) {
                            sh '''
                                echo "$GHCR_TOKEN" | docker login ghcr.io -u nerodelly --password-stdin
                                docker build -t $IMAGE_PREFIX/eureka-service:$BUILD_NUMBER \
                                             -t $IMAGE_PREFIX/eureka-service:latest \
                                             -f eureka-service/Dockerfile .
                                docker push $IMAGE_PREFIX/eureka-service:$BUILD_NUMBER
                                docker push $IMAGE_PREFIX/eureka-service:latest
                            '''
                        }
                    }
                }

                stage('config-server') {
                    when { branch 'main' }
                    steps {
                        withCredentials([string(credentialsId: 'ghcr-token', variable: 'GHCR_TOKEN')]) {
                            sh '''
                                echo "$GHCR_TOKEN" | docker login ghcr.io -u nerodelly --password-stdin
                                docker build -t $IMAGE_PREFIX/config-server:$BUILD_NUMBER \
                                             -t $IMAGE_PREFIX/config-server:latest \
                                             -f config-server/Dockerfile .
                                docker push $IMAGE_PREFIX/config-server:$BUILD_NUMBER
                                docker push $IMAGE_PREFIX/config-server:latest
                            '''
                        }
                    }
                }

                stage('api-gateway') {
                    when { branch 'main' }
                    steps {
                        withCredentials([string(credentialsId: 'ghcr-token', variable: 'GHCR_TOKEN')]) {
                            sh '''
                                echo "$GHCR_TOKEN" | docker login ghcr.io -u nerodelly --password-stdin
                                docker build -t $IMAGE_PREFIX/api-gateway:$BUILD_NUMBER \
                                             -t $IMAGE_PREFIX/api-gateway:latest \
                                             -f api-gateway/Dockerfile .
                                docker push $IMAGE_PREFIX/api-gateway:$BUILD_NUMBER
                                docker push $IMAGE_PREFIX/api-gateway:latest
                            '''
                        }
                    }
                }

                stage('class-service') {
                    when { branch 'main' }
                    steps {
                        withCredentials([string(credentialsId: 'ghcr-token', variable: 'GHCR_TOKEN')]) {
                            sh '''
                                echo "$GHCR_TOKEN" | docker login ghcr.io -u nerodelly --password-stdin
                                docker build -t $IMAGE_PREFIX/class-service:$BUILD_NUMBER \
                                             -t $IMAGE_PREFIX/class-service:latest \
                                             -f class-service/Dockerfile .
                                docker push $IMAGE_PREFIX/class-service:$BUILD_NUMBER
                                docker push $IMAGE_PREFIX/class-service:latest
                            '''
                        }
                    }
                }

                stage('competition-service') {
                    when { branch 'main' }
                    steps {
                        withCredentials([string(credentialsId: 'ghcr-token', variable: 'GHCR_TOKEN')]) {
                            sh '''
                                echo "$GHCR_TOKEN" | docker login ghcr.io -u nerodelly --password-stdin
                                docker build -t $IMAGE_PREFIX/competition-service:$BUILD_NUMBER \
                                             -t $IMAGE_PREFIX/competition-service:latest \
                                             -f competition-service/Dockerfile .
                                docker push $IMAGE_PREFIX/competition-service:$BUILD_NUMBER
                                docker push $IMAGE_PREFIX/competition-service:latest
                            '''
                        }
                    }
                }

                stage('course-service') {
                    when { branch 'main' }
                    steps {
                        withCredentials([string(credentialsId: 'ghcr-token', variable: 'GHCR_TOKEN')]) {
                            sh '''
                                echo "$GHCR_TOKEN" | docker login ghcr.io -u nerodelly --password-stdin
                                docker build -t $IMAGE_PREFIX/course-service:$BUILD_NUMBER \
                                             -t $IMAGE_PREFIX/course-service:latest \
                                             -f course-service/Dockerfile .
                                docker push $IMAGE_PREFIX/course-service:$BUILD_NUMBER
                                docker push $IMAGE_PREFIX/course-service:latest
                            '''
                        }
                    }
                }

                stage('quiz-service') {
                    when { branch 'main' }
                    steps {
                        withCredentials([string(credentialsId: 'ghcr-token', variable: 'GHCR_TOKEN')]) {
                            sh '''
                                echo "$GHCR_TOKEN" | docker login ghcr.io -u nerodelly --password-stdin
                                docker build -t $IMAGE_PREFIX/quiz-service:$BUILD_NUMBER \
                                             -t $IMAGE_PREFIX/quiz-service:latest \
                                             -f quiz-service/Dockerfile .
                                docker push $IMAGE_PREFIX/quiz-service:$BUILD_NUMBER
                                docker push $IMAGE_PREFIX/quiz-service:latest
                            '''
                        }
                    }
                }

                stage('club-event-service') {
                    when { branch 'main' }
                    steps {
                        withCredentials([string(credentialsId: 'ghcr-token', variable: 'GHCR_TOKEN')]) {
                            sh '''
                                echo "$GHCR_TOKEN" | docker login ghcr.io -u nerodelly --password-stdin
                                docker build -t $IMAGE_PREFIX/club-event-service:$BUILD_NUMBER \
                                             -t $IMAGE_PREFIX/club-event-service:latest \
                                             -f club-event-service/Dockerfile .
                                docker push $IMAGE_PREFIX/club-event-service:$BUILD_NUMBER
                                docker push $IMAGE_PREFIX/club-event-service:latest
                            '''
                        }
                    }
                }

                stage('imed-service') {
                    when { branch 'main' }
                    steps {
                        withCredentials([string(credentialsId: 'ghcr-token', variable: 'GHCR_TOKEN')]) {
                            sh '''
                                echo "$GHCR_TOKEN" | docker login ghcr.io -u nerodelly --password-stdin
                                docker build -t $IMAGE_PREFIX/imed-service:$BUILD_NUMBER \
                                             -t $IMAGE_PREFIX/imed-service:latest \
                                             -f imed-service/Dockerfile .
                                docker push $IMAGE_PREFIX/imed-service:$BUILD_NUMBER
                                docker push $IMAGE_PREFIX/imed-service:latest
                            '''
                        }
                    }
                }

                stage('frontend') {
                    when { branch 'main' }
                    steps {
                        withCredentials([string(credentialsId: 'ghcr-token', variable: 'GHCR_TOKEN')]) {
                            sh '''
                                echo "$GHCR_TOKEN" | docker login ghcr.io -u nerodelly --password-stdin
                                docker build -t $IMAGE_PREFIX/frontend:$BUILD_NUMBER \
                                             -t $IMAGE_PREFIX/frontend:latest \
                                             -f frontend/Dockerfile frontend/
                                docker push $IMAGE_PREFIX/frontend:$BUILD_NUMBER
                                docker push $IMAGE_PREFIX/frontend:latest
                            '''
                        }
                    }
                }
            }
        }

        // ── Phase 3: Deploy all to Kubernetes ─────────────────────────────────
        stage('Deploy to Kubernetes') {
            when { branch 'main' }
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE')]) {
                    sh '''
                        export KUBECONFIG=$KUBECONFIG_FILE

                        # Stamp build number into all deployment manifests
                        find k8s/ -name "deployment.yml" -exec \
                            sed -i "s|IMAGE_TAG|$BUILD_NUMBER|g" {} \\;

                        # Namespace & shared config
                        kubectl apply -f k8s/namespace.yml
                        kubectl apply -f k8s/configmap.yml
                        kubectl apply -f k8s/secrets.yml

                        # Infrastructure
                        kubectl apply -f k8s/mysql/
                        kubectl apply -f k8s/rabbitmq/
                        kubectl apply -f k8s/eureka-service/
                        kubectl apply -f k8s/config-server/
                        kubectl rollout status deployment/eureka-service -n learnivo --timeout=120s
                        kubectl rollout status deployment/config-server  -n learnivo --timeout=120s

                        # Microservices
                        kubectl apply -f k8s/user-service/
                        kubectl apply -f k8s/claims-service/
                        kubectl apply -f k8s/class-service/
                        kubectl apply -f k8s/competition-service/
                        kubectl apply -f k8s/course-service/
                        kubectl apply -f k8s/quiz-service/
                        kubectl apply -f k8s/club-event-service/
                        kubectl apply -f k8s/imed-service/

                        # Gateway & frontend
                        kubectl apply -f k8s/api-gateway/
                        kubectl apply -f k8s/frontend/

                        # Verify all rollouts
                        for svc in eureka-service config-server api-gateway user-service \
                            claims-service class-service competition-service course-service \
                            quiz-service club-event-service imed-service frontend; do
                            echo "Verifying $svc..."
                            kubectl rollout status deployment/$svc -n learnivo --timeout=180s
                        done
                    '''
                }
            }
        }
    }

    post {
        success {
            echo '✅ Global pipeline passed — all services deployed'
        }
        failure {
            echo '❌ Global pipeline failed — check stage logs above'
        }
    }
}
