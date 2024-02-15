export default {
  analog: `onJoystick(function(degree,force){
    var maxSpeed = 300
    var sprite = getSprite("name")
    sprite.setVelocityFromDegree(degree,force,maxSpeed)
})`,

  dpad: `onDpad(function(direction){
    var sprite = getSprite("name")
    var speed = 300
    sprite.setVelocityX(0)
    sprite.setVelocityY(0)
    switch(direction) {
        case "left":
            sprite.setVelocityX(-speed)
            break;
        case "right":
            sprite.setVelocityX(speed)
            break;
        case "up":
            sprite.setVelocityY(-speed)
            break;
        case"down":
            sprite.setVelocityY(speed)
            break;
        default:
            break;
    }
})`,
  ranking: `/*
showRanking() : 내림차순으로 랭킹창 보이기 (높은 점수가 상위)
showRankingAscending() : 오름차순으로 랭킹창 보이기 (낮은 점수가 상위)
hideRanking() : 랭킹창 숨기기
saveScore(score) : 랭킹 스코어 저장하기

랭킹관련 함수들은 퍼블리싱을 해야 확인할 수 있습니다. 'Play' > Work list 에서 확인해 보세요.
*/
`,

  camera: `
/*
모바일에서 카메라를 처리할수 있는 스프라이트 입니다. 
한 장면당 하나의 카메라 스프라이트만 가능합니다.

openCamera("front") : 카메라 열기
closeCamera() : 카메라 닫기
switchCamera() : 카메라 방향 전환하기
onFaceDetect(function(face){  : 카메라에서 인식된 얼굴에 대한 정보 가져오기
    face.leftEye : 왼쪽 눈을 감은 정도
    face.rightEye : 오른쪽 눈을 감은 정도
    face.smiling : 웃고 있는 정도

    ex) 
    1. face.leftEye가 0이면 눈을 완전히 감은 상태
    2. face.leftEye가 1이면 눈을 완전히 뜬 상태
    3. face.leftEye가 0.5이면 눈을 반쯤 감은 상태
})
** 카메라 관련 함수들은 위즈앱을 통해서만 동작합니다. **
*/
    `,
};
