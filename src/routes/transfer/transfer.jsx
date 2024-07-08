import axios from "axios";
import * as S from "./styles/transfer.style";
import "react-dropdown/style.css";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import useBottomSheet from "../../hooks/useBottomSheet";
import BottomSheet from "../../components/bottom-sheet";
import OriginAccountList from "../../components/origin-account-list";
import { IoIosArrowDown } from "react-icons/io";

// 입/출금 페이지: 본인 계좌에 입금시 받는 계좌 즉시 주입
export default function Transfer() {
  const { onDragEnd, controls, setIsOpen, isOpen } = useBottomSheet();

  const { accountId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();

  const [originAccount, setOriginAccount] = useState("");
  const [destinationAccount, setDestinationAccount] = useState("");

  const accountData = location.state?.accountData || {};
  const action = location.state?.action || "";

  useEffect(() => {
    if (action === "send") {
      setOriginAccount(accountData.accountNumber);
    } else if (action === "receive") {
      setDestinationAccount(accountData.accountNumber);
    }
  }, [action, accountData]);

  // POST: 이체
  const onSubmit = async ({
    transaction_origin,
    transaction_destination,
    transaction_amount,
    transaction_origin_memo,
    transaction_destination_memo,
    account_pw,
  }) => {
    const transferInfo = {
      transaction_origin,
      transaction_destination,
      transaction_amount,
      transaction_origin_memo,
      transaction_destination_memo,
      account_pw,
    };
    console.log("🚀 ~ Transfer ~ transferInfo:", transferInfo);

    const transferURL = `/api/transaction/${accountId}/transfer`;
    await axios
      .post(transferURL, transferInfo, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (res.status === 200) {
          alert("이체에 성공했습니다");
          navigate("/home");
        }
      })
      .catch((err) => {
        if (err.response) {
          switch (err.response.status) {
            case 400:
              if (err.response.data.message.includes("잔액이 부족")) {
                alert("잔액이 부족합니다. 금액을 확인해주세요.");
              } else {
                alert("유효하지 않은 입력입니다. 입력 값을 확인해주세요.");
              }
              break;
            case 401:
              alert("원본 계좌 인증에 실패했습니다.");
              break;
            case 404:
              alert(
                "목적지 계좌를 찾을 수 없습니다. 계좌 번호를 확인해주세요."
              );
              break;
            case 500:
              alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
              break;
            default:
              alert("에러가 발생했습니다. 관리자에게 문의해주세요.");
              break;
          }
          location.reload();
        } else {
          alert("에러가 발생했습니다. 관리자에게 문의해주세요.");
        }
      });
  };

  return (
    <S.Wrapper>
      <S.FormContainer
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit(onSubmit)}
      >
        <S.Header>이체하기</S.Header>
        {/* 받는 계좌 */}
        <S.DestinationAccountInput
          type="text"
          defaultValue={destinationAccount}
          placeholder="받는사람 계좌번호"
          {...register("transaction_destination", {
            required: true,
            maxLength: 20,
          })}
        />
        {/* 이체 금액 */}
        <S.TransferAmount
          placeholder="보낼 금액"
          {...register("transaction_amount", { required: true, maxLength: 20 })}
        ></S.TransferAmount>
        {/* 보내는 계좌 */}
        <S.OriginAccountContainer>
          <S.OriginAccountInput
            type="text"
            defaultValue={originAccount}
            {...register("transaction_origin", {
              required: true,
              maxLength: 20,
            })}
            onClick={() => setIsOpen(true)}
          />
          <S.IconWrapper>
            <IoIosArrowDown />
          </S.IconWrapper>
        </S.OriginAccountContainer>
        {/* 메모 */}
        <S.MemoContainer>
          <S.Description>받는 분에게 표기</S.Description>
          <S.MemoInput
            maxLength={8}
            {...register("transaction_destination_memo", {
              required: true,
              maxLength: 8,
            })}
          />
        </S.MemoContainer>
        <S.MemoContainer>
          <S.Description>나에게 표기</S.Description>
          <S.MemoInput
            maxLength={8}
            {...register("transaction_origin_memo", {
              required: true,
              maxLength: 8,
            })}
          ></S.MemoInput>
        </S.MemoContainer>
        <S.AccountPwInput
          type="password"
          placeholder="계좌 비밀번호"
          required
          {...register("account_pw", {
            required: true,
            minLength: 6,
            maxLength: 6,
          })}
        />
        <S.TransferBtn type="submit">이체하기</S.TransferBtn>
        {/* <S.NextBtn
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setIsOpen(true);
          }}
        >
          다음
        </S.NextBtn> */}
        <BottomSheet onDragEnd={onDragEnd} controls={controls}>
          <S.BtmSheetContainer>
            <OriginAccountList
              setOriginAccount={setOriginAccount}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
            />
          </S.BtmSheetContainer>
        </BottomSheet>
      </S.FormContainer>
    </S.Wrapper>
  );
}
