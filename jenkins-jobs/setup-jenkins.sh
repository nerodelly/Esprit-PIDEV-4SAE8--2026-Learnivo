#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Jenkins Auto-Setup Script
# Run this after Jenkins is up to create the pipeline job and inject credentials
# Usage: bash jenkins-jobs/setup-jenkins.sh
# ─────────────────────────────────────────────────────────────────────────────

JENKINS_URL="http://localhost:8081"
JENKINS_USER="admin"
JENKINS_PASS="learnivo123"
SONAR_TOKEN_FILE="C:/sonar-token.txt"

echo "=== Learnivo Jenkins Setup ==="

# Wait for Jenkins to be ready
echo "Waiting for Jenkins..."
until curl -s -o /dev/null -w "%{http_code}" "${JENKINS_URL}/login" | grep -q "200"; do
  sleep 5
done
echo "Jenkins is up."

# Get crumb for CSRF
CRUMB=$(curl -s -u "${JENKINS_USER}:${JENKINS_PASS}" \
  "${JENKINS_URL}/crumbIssuer/api/json" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['crumbRequestField']+':'+d['crumb'])")

echo "Got crumb: ${CRUMB}"

# Create the global pipeline job from SCM
echo "Creating learnivo-pipeline job..."
curl -s -X POST "${JENKINS_URL}/createItem?name=learnivo-pipeline" \
  -u "${JENKINS_USER}:${JENKINS_PASS}" \
  -H "${CRUMB}" \
  -H "Content-Type: application/xml" \
  --data-binary @jenkins-jobs/learnivo-pipeline-final.xml
echo " Done."

# Create ci-claims-service job
echo "Creating ci-claims-service job..."
curl -s -X POST "${JENKINS_URL}/createItem?name=ci-claims-service" \
  -u "${JENKINS_USER}:${JENKINS_PASS}" \
  -H "${CRUMB}" \
  -H "Content-Type: application/xml" \
  --data-binary @- <<EOF
<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job">
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition" plugin="workflow-cps">
    <scm class="hudson.plugins.git.GitSCM" plugin="git">
      <userRemoteConfigs>
        <hudson.plugins.git.UserRemoteConfig>
          <url>https://github.com/nerodelly/Esprit-PIDEV-4SAE8--2026-Learnivo.git</url>
        </hudson.plugins.git.UserRemoteConfig>
      </userRemoteConfigs>
      <branches>
        <hudson.plugins.git.BranchSpec><name>*/mouhamedwork</name></hudson.plugins.git.BranchSpec>
      </branches>
    </scm>
    <scriptPath>claims-service/Jenkinsfile</scriptPath>
    <lightweight>true</lightweight>
  </definition>
  <disabled>false</disabled>
</flow-definition>
EOF
echo " Done."

# Create ci-user-service job
echo "Creating ci-user-service job..."
curl -s -X POST "${JENKINS_URL}/createItem?name=ci-user-service" \
  -u "${JENKINS_USER}:${JENKINS_PASS}" \
  -H "${CRUMB}" \
  -H "Content-Type: application/xml" \
  --data-binary @- <<EOF
<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job">
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition" plugin="workflow-cps">
    <scm class="hudson.plugins.git.GitSCM" plugin="git">
      <userRemoteConfigs>
        <hudson.plugins.git.UserRemoteConfig>
          <url>https://github.com/nerodelly/Esprit-PIDEV-4SAE8--2026-Learnivo.git</url>
        </hudson.plugins.git.UserRemoteConfig>
      </userRemoteConfigs>
      <branches>
        <hudson.plugins.git.BranchSpec><name>*/mouhamedwork</name></hudson.plugins.git.BranchSpec>
      </branches>
    </scm>
    <scriptPath>user-service/Jenkinsfile</scriptPath>
    <lightweight>true</lightweight>
  </definition>
  <disabled>false</disabled>
</flow-definition>
EOF
echo " Done."

# Inject SonarQube token if file exists
if [ -f "${SONAR_TOKEN_FILE}" ]; then
  SONAR_TOKEN=$(cat "${SONAR_TOKEN_FILE}")
  echo "Injecting SonarQube token..."
  curl -s -X POST "${JENKINS_URL}/credentials/store/system/domain/_/createCredentials" \
    -u "${JENKINS_USER}:${JENKINS_PASS}" \
    -H "${CRUMB}" \
    --data-urlencode "json={
      \"\": \"0\",
      \"credentials\": {
        \"scope\": \"GLOBAL\",
        \"id\": \"sonarqube-token\",
        \"secret\": \"${SONAR_TOKEN}\",
        \"description\": \"SonarQube API Token\",
        \"\$class\": \"org.jenkinsci.plugins.plaincredentials.impl.StringCredentialsImpl\"
      }
    }"
  echo " Done."
fi

echo ""
echo "=== Setup Complete ==="
echo "Jenkins:   http://localhost:8081  (admin / learnivo123)"
echo "SonarQube: http://localhost:9000  (admin / learnivo123)"
echo "Grafana:   http://localhost:3000  (admin / learnivo123)"
echo "Prometheus: http://localhost:9091"
echo ""
echo "Next steps:"
echo "1. Install plugins: Pipeline, Git, SonarQube Scanner, GitHub Integration"
echo "2. Configure SonarQube server in Jenkins: Manage Jenkins > Configure System"
echo "3. Run 'ngrok http 8081' and add webhook to GitHub for auto-triggers"
echo "4. Add kubeconfig credential (ID: kubeconfig) for K8s deploy stage"
